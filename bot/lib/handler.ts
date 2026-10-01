/**
 * Message Event Router & Command Handler
 * Enforces rate limiting, permissions, anti-ban protections, and error handling.
 */

import fs from 'fs';
import { config, isOwnerNumber } from '../config.ts';
import { getCommand } from '../commands/index.ts';
import { getUser, isPersistentPremium } from '../database/models/User.ts';
import { getGroup } from '../database/models/Group.ts';
import { checkRateLimit } from './antiSpam.ts';
import { formatError } from './formatter.ts';
import { convertToWhatsAppVoiceNote } from './mediaDownloader.ts';
import { resolveRealPhoneNumber } from './lidResolver.ts';
import { checkAndHandleGameAnswer, getGameSession } from './gameSession.ts';
import { convertToWebpSticker } from './imageProcessor.ts';
import { recordCommandHit } from './commandStats.ts';
import { findClosestCommand } from './fuzzyMatch.ts';

export interface HandleMessageOptions {
  sock?: any;
  m?: any;
  senderJid: string;
  senderName?: string;
  groupJid?: string;
  body: string;
  isGroupAdmin?: boolean;
  isBotAdmin?: boolean;
  sendReply?: (text: string, options?: any) => Promise<any>;
  sendReaction?: (emoji: string) => Promise<any>;
  sendImage?: (imageUrlOrBuffer: string | Buffer, caption?: string) => Promise<any>;
}

export async function handleIncomingMessage(opts: HandleMessageOptions): Promise<{ executed: boolean; replyText?: string; error?: string }> {
  const {
    sock,
    m,
    senderJid: rawSenderJid,
    senderName = 'User',
    groupJid,
    body = '',
    isGroupAdmin = false,
    isBotAdmin = false,
    sendReply,
    sendReaction
  } = opts;

  // Resolusi nomor telepon nyata jika pengirim adalah akun Multi-Device LID WhatsApp Web
  const resolvedIdentity = resolveRealPhoneNumber(rawSenderJid);
  const senderJid = resolvedIdentity.jid;

  const reply = sendReply || (async (t: string) => { console.log(`[BOT REPLY to ${senderJid}]: ${t}`); return t; });
  const react = sendReaction || (async (e: string) => { console.log(`[BOT REACT ${e}]`); });

  const isGroup = Boolean(groupJid);
  // Status Owner HANYA diberikan jika nomor pengirim cocok dengan whitelist Owner resmi
  const isOwner = isOwnerNumber(senderJid) || isOwnerNumber(rawSenderJid);

  // 0. Auto-sync user state whenever ANY message/chat arrives
  try {
    const activeUser = await getUser(senderJid, senderName);
    if (isPersistentPremium(senderJid) && activeUser.role !== 'owner') {
      if (!activeUser.premium || activeUser.role !== 'premium') {
        activeUser.premium = true;
        activeUser.role = 'premium';
        activeUser.limit = Math.max(activeUser.limit || 0, 999999);
        await activeUser.save?.();
        console.log(`[AUTO-PREM] ✨ Nomor ${senderJid} ngechat dan langsung aktif VIP otomatis!`);
      }
    }
  } catch (_) {}

  // Extract quoted reply info if user replied to a message
  const contextInfo = m?.message?.extendedTextMessage?.contextInfo ||
                      m?.message?.imageMessage?.contextInfo ||
                      m?.message?.videoMessage?.contextInfo ||
                      m?.message?.buttonsResponseMessage?.contextInfo;

  const quotedStanzaId = contextInfo?.stanzaId;
  const quotedParticipant = contextInfo?.participant;
  const quotedText = contextInfo?.quotedMessage?.conversation ||
                     contextInfo?.quotedMessage?.extendedTextMessage?.text || '';
  const isQuotedReply = Boolean(contextInfo?.quotedMessage || quotedStanzaId);
  const botJid = sock?.user?.id ? sock.user.id.split(':')[0] : '';

  // Check if an active minigame session exists for this chat
  const targetChatJid = groupJid || senderJid || m?.key?.remoteJid;
  const isFromMe = Boolean(m?.key?.fromMe);
  const activeGame = targetChatJid && !isFromMe ? getGameSession(targetChatJid) : undefined;

  const prefix = config.prefix || '.';
  const trimmed = body.trim();

  if (activeGame) {
    const withoutPrefix = trimmed.startsWith(prefix) ? trimmed.slice(prefix.length).trim() : trimmed;
    const [possibleCmd] = withoutPrefix.split(/\s+/);
    const targetCmd = getCommand(possibleCmd);

    // If message is NOT a different command (e.g., .menu), process as a guess or surrender for minigame!
    if (!targetCmd || targetCmd.category === 'GAME') {
      const activeUser = await getUser(senderJid, senderName);
      const answerText = trimmed.startsWith(prefix) ? withoutPrefix : trimmed;
      const handled = await checkAndHandleGameAnswer(
        targetChatJid,
        answerText,
        activeUser,
        reply,
        react,
        {
          isQuotedReply,
          quotedStanzaId,
          quotedParticipant,
          quotedText,
          botJid
        }
      );
      if (handled) {
        return { executed: true, replyText: 'Minigame Answer' };
      }
    }
  }

  // Check prefix for normal commands
  if (!trimmed.startsWith(prefix)) {
    // Handle QR Scan Message Trigger (e.g. "qrlok lok_xxx" sent when scanning QR)
    if (trimmed.toLowerCase().startsWith('qrlok lok_')) {
      const qrId = trimmed.split(/\s+/)[1]?.trim();
      if (qrId) {
        try {
          const { getQrLocationRecord, addScanLogToQrLocation } = await import('../database/models/QrLocation.ts');
          const record = await getQrLocationRecord(qrId);
          if (record) {
            const scanData = {
              timestamp: new Date(),
              ip: senderJid,
              userAgent: `WhatsApp (${senderName})`,
              latitude: 0,
              longitude: 0,
              accuracy: 0,
              googleMapsUrl: ''
            };
            await addScanLogToQrLocation(qrId, scanData);

            await reply(
              `✨ *PESAN QR CODE PELACAK LOKASI* 📍\n\n` +
              `💬 *Pesan:* "${record.message}"\n\n` +
              `----------------------------------------\n` +
              `✅ *Status:* Data penye-scan kamu (*@${senderJid.split('@')[0]}*) telah tersimpan di Database!\n\n` +
              `📍 *Bagikan Lokasi Kamu:* Silakan ketik/klik tombol *Bagikan Lokasi (Share Location)* di WhatsApp agar koordinat GPS kamu terhubung langsung!`
            );

            // Send instant notification to QR creator
            if (sock && record.creatorJid) {
              const notifText =
                `🔔 *QR CODE KAMU BARU SAJA DI-SCAN!* 📍\n\n` +
                `• 👤 *Penye-Scan:* ${senderName} (@${senderJid.split('@')[0]})\n` +
                `• 💬 *Pesan QR:* "${record.message}"\n` +
                `• ⏱️ *Waktu:* ${new Date().toLocaleString('id-ID')}\n` +
                `• 📦 *ID:* \`${qrId}\`\n\n` +
                `_Data scan telah tersimpan secara permanen di Database!_`;
              await sock.sendMessage(record.creatorJid, { text: notifText });
            }

            return { executed: true, replyText: 'QRLok Scan Recorded' };
          }
        } catch (e: any) {
          console.warn('[handler] QRLok scan message error:', e.message);
        }
      }
    }

    // Balasan ramah jika user auto-prem menyapa secara private
    if (!isGroup && isPersistentPremium(senderJid) && trimmed.toLowerCase().match(/^(halo|hai|p|tes|test|assalamualaikum|ping|hallo)$/)) {
      await reply(`👑 *Halo VIP Member!* Status nomor kamu terdaftar di database *Auto-Premium (VIP)* dengan Limit Unlimited. Ketik *${prefix}menu* atau *${prefix}profile* untuk melihat fitur.`);
      return { executed: true, replyText: 'VIP Greeting' };
    }
    return { executed: false };
  }

  // Parse command and args
  const withoutPrefix = trimmed.slice(prefix.length).trim();
  const [cmdName, ...args] = withoutPrefix.split(/\s+/);
  const commandText = withoutPrefix.slice(cmdName.length).trim();

  if (!cmdName) return { executed: false };

  // Lookup command
  const command = getCommand(cmdName);
  if (!command) {
    // Perform Fuzzy Typo Matching for misspelt commands
    const { getAllCommands } = await import('../commands/index.ts');
    const allCmds = getAllCommands();
    const suggestion = findClosestCommand(cmdName, allCmds);

    if (suggestion && suggestion.bestMatch) {
      let sugText = `❓ *PERINTAH TIDAK DITEMUKAN*\n\nApakah maksudmu: *${prefix}${suggestion.bestMatch}* ?`;
      if (suggestion.alternatives && suggestion.alternatives.length > 0) {
        sugText += `\nPilihan lainnya: ${suggestion.alternatives.map(a => `*${prefix}${a}*`).join(', ')}`;
      }
      sugText += `\n\n💡 *Tips:* Ketik *${prefix}menu* untuk melihat seluruh daftar perintah.`;
      await reply(sugText);
      return { executed: false, error: 'Command typo suggested' };
    } else {
      await reply(
        `❓ *PERINTAH TIDAK DIKENAL*\n\nPerintah *${prefix}${cmdName}* tidak terdaftar di sistem.\nKetik *${prefix}menu* atau *${prefix}allmenu* untuk melihat seluruh daftar perintah yang tersedia.`
      );
      return { executed: false, error: 'Command not found' };
    }
  }

  try {
    // 1. Fetch User Data
    const user = await getUser(senderJid, senderName);

    // 2. Check if user is banned
    if (user.banned && !isOwner) {
      await reply(`🚫 *AKUN DIBLOKIR*\nAkun kamu telah diblokir dari sistem bot.\nAlasan: ${user.banReason || 'Pelanggaran ketentuan'}`);
      return { executed: false, error: 'User banned' };
    }

    // 3. Fetch Group Data if in group
    let group = null;
    if (isGroup && groupJid) {
      group = await getGroup(groupJid);
      if (group.mute && !isOwner && !isGroupAdmin) {
        return { executed: false, error: 'Group muted' };
      }
      if (group.isBanned && !isOwner) {
        return { executed: false, error: 'Group banned' };
      }
    }

    // 4. Role & Premium Check
    const isPremium = user.premium || isOwner || (user.premiumExpired && new Date(user.premiumExpired) > new Date());
    const isPartner = user.role === 'partner' || isOwner;

    // 5. Permission Enforcement
    if (command.ownerOnly && !isOwner) {
      await reply(`👑 Fitur ini khusus untuk *Owner Bot*! Hubungi wa.me/${config.ownerNumber}`);
      return { executed: false, error: 'Owner only' };
    }

    if (command.groupOnly && !isGroup) {
      await reply(`👥 Fitur ini hanya dapat digunakan di dalam *Grup WhatsApp*!`);
      return { executed: false, error: 'Group only' };
    }

    if (command.adminOnly && !isGroupAdmin && !isOwner) {
      await reply(`👮 Fitur ini hanya dapat dijalankan oleh *Admin Grup*!`);
      return { executed: false, error: 'Admin only' };
    }

    if (command.premiumOnly && !isPremium) {
      await reply(`🌟 Fitur ini eksklusif untuk *User Premium*!\nKetik *${prefix}benefitpremium* untuk info berlangganan.`);
      return { executed: false, error: 'Premium only' };
    }

    // 6. Anti-Ban Rate Limiting & Cooldown
    const rateCheck = checkRateLimit(senderJid, command.name, isPremium);
    if (!rateCheck.allowed && !isOwner) {
      await reply(`⚠️ ${rateCheck.reason}`);
      return { executed: false, error: 'Rate limit' };
    }

    // 7. Limit / Energi System
    const limitCost = command.limitCost || 0;
    if (!isPremium && limitCost > 0) {
      if (user.limit < limitCost) {
        await reply(`⚡ *LIMIT ENERGI HABIS*\nKamu membutuhkan ${limitCost} limit, tersisa ${user.limit} limit.\n\n_Beli tambahan limit dengan ${prefix}buyenergi atau tunggu reset harian pukul 00:00 WIB._`);
        return { executed: false, error: 'Limit exceeded' };
      }
      user.limit -= limitCost;
    }

    // 8. Visual Reaction for Heavy Operations
    if (['ai', 'gpt4o', 'gemini', 'text2img', 'tiktok', 'ytmp3', 'ytmp4', 'hd', 'removebg'].includes(command.name)) {
      await react('⏳');
    }

    // 9. Execute Command
    user.totalHit = (user.totalHit || 0) + 1;
    user.exp = (user.exp || 0) + 10;
    try { recordCommandHit(command.name, command.category); } catch (_) {}
    await user.save?.();

    let capturedReply = '';
    const executionReply = async (text: string, options?: any) => {
      capturedReply = text;
      return await reply(text, options);
    };

    const targetJid = groupJid || senderJid;
    const sendAudio = async (audioUrlOrBuffer: string | Buffer, ptt = true, caption?: string) => {
      if (sock) {
        try {
          const mediaDownloader = await import('./mediaDownloader.ts');
          let sendPayload: Buffer | null = null;
          let mimetype = 'audio/ogg; codecs=opus';
          let isPtt = ptt;

          // Attempt 1: Try Voice Note conversion directly (handles Buffers, files, and URLs)
          if (ptt) {
            try {
              const converted = await mediaDownloader.convertToWhatsAppVoiceNote(audioUrlOrBuffer);
              sendPayload = converted.buffer;
              mimetype = converted.mimetype;
              isPtt = true;
            } catch (errVn: any) {
              console.warn('[handler] Voice Note conversion failed, fallback to raw buffer:', errVn.message);
              isPtt = false;
            }
          }

          // Attempt 2: If Voice Note conversion failed or ptt=false, fetch raw buffer
          if (!sendPayload) {
            if (Buffer.isBuffer(audioUrlOrBuffer)) {
              sendPayload = audioUrlOrBuffer;
            } else if (typeof audioUrlOrBuffer === 'string') {
              if (audioUrlOrBuffer.startsWith('http')) {
                sendPayload = await mediaDownloader.fetchMediaBuffer(audioUrlOrBuffer);
              } else if (fs.existsSync(audioUrlOrBuffer)) {
                sendPayload = await fs.promises.readFile(audioUrlOrBuffer);
              }
            }
            mimetype = 'audio/mp4';
          }

          // Attempt 3: Send audio payload to WhatsApp with cascading fallbacks
          if (sendPayload && sendPayload.length > 500) {
            try {
              return await sock.sendMessage(targetJid, {
                audio: sendPayload,
                mimetype,
                ptt: isPtt
              }, { quoted: m });
            } catch (errSend: any) {
              console.warn('[handler] Send Voice Chat failed, trying fallback as audio/mp4:', errSend.message);
              try {
                return await sock.sendMessage(targetJid, {
                  audio: sendPayload,
                  mimetype: 'audio/mp4',
                  ptt: false
                }, { quoted: m });
              } catch (errMp4: any) {
                console.warn('[handler] Send MP4 failed, sending as Document:', errMp4.message);
                return await sock.sendMessage(targetJid, {
                  document: sendPayload,
                  mimetype: 'audio/mpeg',
                  fileName: 'music.mp3',
                  caption: caption || '🎧 Audio Download'
                }, { quoted: m });
              }
            }
          } else if (typeof audioUrlOrBuffer === 'string' && audioUrlOrBuffer.startsWith('http')) {
            // Direct URL Fallback
            return await sock.sendMessage(targetJid, {
              audio: { url: audioUrlOrBuffer },
              mimetype: 'audio/mp4',
              ptt: false
            }, { quoted: m });
          }
        } catch (e: any) {
          console.warn('[handler] sock sendAudio failed:', e.message);
        }
      }
      return await executionReply(caption || `🎧 [Audio Voice Chat]: Transmisi audio selesai.`);
    };

    const sendVideo = async (videoUrlOrBuffer: string | Buffer, caption?: string) => {
      if (sock) {
        try {
          return await sock.sendMessage(targetJid, {
            video: typeof videoUrlOrBuffer === 'string' ? { url: videoUrlOrBuffer } : videoUrlOrBuffer,
            caption: caption || '',
            mimetype: 'video/mp4'
          }, { quoted: m });
        } catch (e: any) {
          console.warn('[handler] sock sendVideo failed, falling back to text:', e.message);
        }
      }
      return await executionReply(caption ? `${caption}\n\n🎬 [Video Link]: ${videoUrlOrBuffer}` : `🎬 [Video Link]: ${videoUrlOrBuffer}`);
    };

    const sendImage = async (imageUrlOrBuffer: string | Buffer, caption?: string) => {
      if (opts.sendImage) {
        return await opts.sendImage(imageUrlOrBuffer, caption);
      }
      if (sock) {
        try {
          return await sock.sendMessage(targetJid, {
            image: typeof imageUrlOrBuffer === 'string' ? { url: imageUrlOrBuffer } : imageUrlOrBuffer,
            caption: caption || '',
            mimetype: 'image/jpeg'
          }, { quoted: m });
        } catch (e: any) {
          console.warn('[handler] sock sendImage failed, falling back to text:', e.message);
        }
      }
      return await executionReply(caption ? `${caption}\n\n🖼️ [Gambar]: ${typeof imageUrlOrBuffer === 'string' ? imageUrlOrBuffer : 'QRIS Image'}` : `🖼️ [Gambar]: ${typeof imageUrlOrBuffer === 'string' ? imageUrlOrBuffer : 'QRIS Image'}`);
    };

    const sendSticker = async (stickerBufferOrUrl: string | Buffer) => {
      if (sock) {
        try {
          let webpBuf: Buffer;
          if (typeof stickerBufferOrUrl === 'string') {
            const res = await fetch(stickerBufferOrUrl);
            const arrayBuf = await res.arrayBuffer();
            webpBuf = await convertToWebpSticker(Buffer.from(arrayBuf));
          } else {
            webpBuf = await convertToWebpSticker(stickerBufferOrUrl);
          }

          return await sock.sendMessage(targetJid, {
            sticker: webpBuf
          }, { quoted: m });
        } catch (e: any) {
          console.warn('[handler] sock sendSticker failed:', e.message);
        }
      }
      return await executionReply(`✨ [Stiker WA Berhasil Dibuat]`);
    };

    await command.execute({
      sock,
      m,
      senderJid,
      user,
      group,
      args,
      text: commandText,
      command: cmdName,
      prefix,
      isOwner,
      isPremium: Boolean(isPremium),
      isPartner: Boolean(isPartner),
      isGroup,
      isAdmin: isGroupAdmin,
      isBotAdmin,
      reply: executionReply,
      sendAudio,
      sendVideo,
      sendImage,
      sendSticker,
      react
    });

    return { executed: true, replyText: capturedReply };
  } catch (err: any) {
    console.error(`❌ [ERROR in ${cmdName}]:`, err);
    await reply(formatError(`Terjadi kendala saat memproses perintah *${cmdName}*:\n_${err.message}_`));
    return { executed: false, error: err.message };
  }
}
