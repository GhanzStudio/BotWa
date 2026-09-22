/**
 * Message Event Router & Command Handler
 * Enforces rate limiting, permissions, anti-ban protections, and error handling.
 */

import { config } from '../config.ts';
import { getCommand } from '../commands/index.ts';
import { getUser } from '../database/models/User.ts';
import { getGroup } from '../database/models/Group.ts';
import { checkRateLimit } from './antiSpam.ts';
import { formatError } from './formatter.ts';

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
}

export async function handleIncomingMessage(opts: HandleMessageOptions): Promise<{ executed: boolean; replyText?: string; error?: string }> {
  const {
    sock,
    m,
    senderJid,
    senderName = 'User',
    groupJid,
    body = '',
    isGroupAdmin = false,
    isBotAdmin = false,
    sendReply,
    sendReaction
  } = opts;

  const reply = sendReply || (async (t: string) => { console.log(`[BOT REPLY to ${senderJid}]: ${t}`); return t; });
  const react = sendReaction || (async (e: string) => { console.log(`[BOT REACT ${e}]`); });

  const isGroup = Boolean(groupJid);
  const cleanSenderNumber = senderJid.split('@')[0].replace(/\D/g, '');
  const isOwner = cleanSenderNumber === config.ownerNumber.replace(/\D/g, '');

  // Check prefix
  const prefix = config.prefix || '.';
  const trimmed = body.trim();
  if (!trimmed.startsWith(prefix)) {
    return { executed: false };
  }

  // Parse command and args
  const withoutPrefix = trimmed.slice(prefix.length).trim();
  const [cmdName, ...args] = withoutPrefix.split(/\s+/);
  const commandText = withoutPrefix.slice(cmdName.length).trim();

  if (!cmdName) return { executed: false };

  // Lookup command
  const command = getCommand(cmdName);
  if (!command) return { executed: false };

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
    await user.save?.();

    let capturedReply = '';
    const executionReply = async (text: string, options?: any) => {
      capturedReply = text;
      return await reply(text, options);
    };

    await command.execute({
      sock,
      m,
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
      react
    });

    return { executed: true, replyText: capturedReply };
  } catch (err: any) {
    console.error(`❌ [ERROR in ${cmdName}]:`, err);
    await reply(formatError(`Terjadi kendala saat memproses perintah *${cmdName}*:\n_${err.message}_`));
    return { executed: false, error: err.message };
  }
}
