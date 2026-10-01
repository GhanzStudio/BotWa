/**
 * AI Image Enhancement, 4K Remini Sharpener, WebP Sticker Generator
 * & Multimodal Media Extractor (Supports direct images, quoted images, and self-replies)
 */

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import sharp from 'sharp';

const execAsync = util.promisify(exec);

/**
 * Generic media extractor for direct or quoted messages (images, stickers, videos, audio)
 */
export async function downloadMediaFromCtx(m: any, mediaType: 'image' | 'sticker' | 'video' | 'audio' | 'any' = 'any'): Promise<{ buffer: Buffer; mimetype: string; type: string } | null> {
  if (!m || !m.message) return null;

  const msg = m.message.ephemeralMessage?.message ||
              m.message.viewOnceMessage?.message ||
              m.message.viewOnceMessageV2?.message ||
              m.message;

  // Check direct media
  let targetMediaKey = '';
  if (mediaType === 'image' || mediaType === 'any') {
    if (msg.imageMessage) targetMediaKey = 'imageMessage';
  }
  if (!targetMediaKey && (mediaType === 'sticker' || mediaType === 'any')) {
    if (msg.stickerMessage) targetMediaKey = 'stickerMessage';
  }
  if (!targetMediaKey && (mediaType === 'video' || mediaType === 'any')) {
    if (msg.videoMessage) targetMediaKey = 'videoMessage';
  }
  if (!targetMediaKey && (mediaType === 'audio' || mediaType === 'any')) {
    if (msg.audioMessage) targetMediaKey = 'audioMessage';
  }

  if (targetMediaKey) {
    try {
      const buf = await downloadMediaMessage(m, 'buffer', {});
      if (buf && buf.length > 0) {
        const mime = msg[targetMediaKey]?.mimetype || 'application/octet-stream';
        return { buffer: buf, mimetype: mime, type: targetMediaKey };
      }
    } catch (err: any) {
      console.warn('[ImageProcessor] Direct media download error:', err.message);
    }
  }

  // Check quoted / replied media
  const contextInfo = msg.extendedTextMessage?.contextInfo ||
                      msg.imageMessage?.contextInfo ||
                      msg.videoMessage?.contextInfo ||
                      msg.stickerMessage?.contextInfo ||
                      msg.audioMessage?.contextInfo ||
                      msg.buttonsResponseMessage?.contextInfo ||
                      msg.templateButtonReplyMessage?.contextInfo ||
                      msg.listResponseMessage?.contextInfo ||
                      msg.interactiveResponseMessage?.contextInfo ||
                      msg.conversation?.contextInfo;

  const quotedMsg = contextInfo?.quotedMessage;
  if (quotedMsg) {
    const unwrappedQuoted = quotedMsg.ephemeralMessage?.message ||
                            quotedMsg.viewOnceMessage?.message ||
                            quotedMsg.viewOnceMessageV2?.message ||
                            quotedMsg;

    let quotedMediaObj: any = null;
    let quotedMediaKey = '';

    if (mediaType === 'image' || mediaType === 'any') {
      quotedMediaObj = unwrappedQuoted.imageMessage || (unwrappedQuoted.documentMessage?.mimetype?.startsWith('image/') ? unwrappedQuoted.documentMessage : null);
      if (quotedMediaObj) quotedMediaKey = 'imageMessage';
    }
    if (!quotedMediaObj && (mediaType === 'sticker' || mediaType === 'any')) {
      quotedMediaObj = unwrappedQuoted.stickerMessage;
      if (quotedMediaObj) quotedMediaKey = 'stickerMessage';
    }
    if (!quotedMediaObj && (mediaType === 'video' || mediaType === 'any')) {
      quotedMediaObj = unwrappedQuoted.videoMessage;
      if (quotedMediaObj) quotedMediaKey = 'videoMessage';
    }
    if (!quotedMediaObj && (mediaType === 'audio' || mediaType === 'any')) {
      quotedMediaObj = unwrappedQuoted.audioMessage;
      if (quotedMediaObj) quotedMediaKey = 'audioMessage';
    }

    if (quotedMediaObj && quotedMediaKey) {
      const remoteJid = m.key?.remoteJid;
      const stanzaId = contextInfo.stanzaId;
      const participant = contextInfo.participant || m.key?.participant || (m.key?.fromMe ? remoteJid : undefined);

      const attempts = [
        { key: { remoteJid, id: stanzaId, participant }, message: { [quotedMediaKey]: quotedMediaObj } },
        { key: { remoteJid, id: stanzaId, participant, fromMe: true }, message: { [quotedMediaKey]: quotedMediaObj } },
        { key: { remoteJid, id: stanzaId, participant, fromMe: false }, message: { [quotedMediaKey]: quotedMediaObj } },
        { key: { remoteJid, id: stanzaId }, message: { [quotedMediaKey]: quotedMediaObj } },
        { message: { [quotedMediaKey]: quotedMediaObj } }
      ];

      for (const quotedObj of attempts) {
        try {
          const buf = await downloadMediaMessage(quotedObj as any, 'buffer', {});
          if (buf && buf.length > 0) {
            const mime = quotedMediaObj.mimetype || 'application/octet-stream';
            return { buffer: buf, mimetype: mime, type: quotedMediaKey };
          }
        } catch (_) {}
      }
    }
  }

  return null;
}

/**
 * Downloads image buffer from direct image message OR quoted image message
 * (Full support for self-replies, group replies, albums, and viewOnce messages)
 */
export async function downloadImageFromCtx(m: any): Promise<Buffer | null> {
  if (!m || !m.message) return null;

  // Unwrap inner message (handling ephemeral / viewOnce wrappers)
  const msg = m.message.ephemeralMessage?.message ||
              m.message.viewOnceMessage?.message ||
              m.message.viewOnceMessageV2?.message ||
              m.message;

  // 1. Direct Image Message
  const directImage = msg.imageMessage ||
                      msg.viewOnceMessage?.message?.imageMessage ||
                      msg.viewOnceMessageV2?.message?.imageMessage;

  if (directImage) {
    try {
      const buf = await downloadMediaMessage(m, 'buffer', {});
      if (buf && buf.length > 0) return buf;
    } catch (err: any) {
      console.warn('[ImageProcessor] Direct image download error:', err.message);
    }
  }

  // 2. Quoted / Replied Image Message
  const contextInfo = msg.extendedTextMessage?.contextInfo ||
                      msg.imageMessage?.contextInfo ||
                      msg.videoMessage?.contextInfo ||
                      msg.buttonsResponseMessage?.contextInfo ||
                      msg.templateButtonReplyMessage?.contextInfo ||
                      msg.listResponseMessage?.contextInfo ||
                      msg.interactiveResponseMessage?.contextInfo ||
                      msg.conversation?.contextInfo;

  const quotedMsg = contextInfo?.quotedMessage;
  if (quotedMsg) {
    const unwrappedQuoted = quotedMsg.ephemeralMessage?.message ||
                            quotedMsg.viewOnceMessage?.message ||
                            quotedMsg.viewOnceMessageV2?.message ||
                            quotedMsg;

    const quotedImage = unwrappedQuoted.imageMessage ||
                        unwrappedQurappedImage(unwrappedQuoted);

    if (quotedImage) {
      const remoteJid = m.key?.remoteJid;
      const stanzaId = contextInfo.stanzaId;
      const participant = contextInfo.participant || m.key?.participant || (m.key?.fromMe ? remoteJid : undefined);

      const attempts = [
        // Attempt A: Direct message object with imageMessage
        {
          key: { remoteJid, id: stanzaId, participant },
          message: { imageMessage: quotedImage }
        },
        // Attempt B: Set fromMe=true if replied to oneself
        {
          key: { remoteJid, id: stanzaId, participant, fromMe: true },
          message: { imageMessage: quotedImage }
        },
        // Attempt C: Set fromMe=false
        {
          key: { remoteJid, id: stanzaId, participant, fromMe: false },
          message: { imageMessage: quotedImage }
        },
        // Attempt D: Key without participant
        {
          key: { remoteJid, id: stanzaId },
          message: { imageMessage: quotedImage }
        },
        // Attempt E: Minimal object
        {
          message: { imageMessage: quotedImage }
        }
      ];

      for (const quotedObj of attempts) {
        try {
          const buf = await downloadMediaMessage(quotedObj as any, 'buffer', {});
          if (buf && buf.length > 0) {
            console.log(`[ImageProcessor] Successfully downloaded quoted image buffer (${buf.length} bytes)`);
            return buf;
          }
        } catch (_) {
          // Continue to next attempt
        }
      }
    }
  }

  return null;
}

function unwrappedQurappedImage(msg: any): any {
  if (!msg) return null;
  if (msg.imageMessage) return msg.imageMessage;
  if (msg.viewOnceMessage?.message?.imageMessage) return msg.viewOnceMessage.message.imageMessage;
  if (msg.viewOnceMessageV2?.message?.imageMessage) return msg.viewOnceMessageV2.message.imageMessage;
  if (msg.viewOnceMessageV2Extension?.message?.imageMessage) return msg.viewOnceMessageV2Extension.message.imageMessage;
  if (msg.documentMessage?.mimetype?.startsWith('image/')) return msg.documentMessage;
  if (msg.documentWithCaptionMessage?.message?.documentMessage?.mimetype?.startsWith('image/')) return msg.documentWithCaptionMessage.message.documentMessage;
  return null;
}

/**
 * Converts any image Buffer into a native WhatsApp WebP Sticker Buffer (512x512 centered)
 */
export async function convertToWebpSticker(buffer: Buffer): Promise<Buffer> {
  try {
    const webpBuf = await sharp(buffer)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 80 })
      .toBuffer();
    if (webpBuf && webpBuf.length > 200) return webpBuf;
  } catch (err: any) {
    console.warn('[ImageProcessor] sharp convertToWebpSticker error, falling back to FFmpeg:', err.message);
  }

  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `in_sticker_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);
  const outputPath = path.join(tmpDir, `out_sticker_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`);

  try {
    await fs.promises.writeFile(inputPath, buffer);
    const cmd = `ffmpeg -y -i "${inputPath}" -vf "scale='if(gt(a,1),512,-1)':'if(gt(a,1),-1,512)',pad=512:512:(512-iw)/2:(512-ih)/2:color=0x00000000" -vcodec libwebp -lossless 0 -compression_level 6 -qscale 80 -preset default -an -vsync 0 "${outputPath}"`;
    await execAsync(cmd);
    const webpBuffer = await fs.promises.readFile(outputPath);
    return webpBuffer;
  } catch (err: any) {
    console.warn('[ImageProcessor] convertToWebpSticker error:', err.message);
    return buffer;
  } finally {
    try { await fs.promises.unlink(inputPath); } catch (_) {}
    try { await fs.promises.unlink(outputPath); } catch (_) {}
  }
}

/**
 * Converts a WebP Sticker Buffer to JPG/PNG Image Buffer (.toimg)
 */
export async function convertStickerToImage(buffer: Buffer): Promise<Buffer> {
  try {
    const jpgBuf = await sharp(buffer)
      .jpeg({ quality: 92 })
      .toBuffer();
    if (jpgBuf && jpgBuf.length > 500) return jpgBuf;
  } catch (err: any) {
    console.warn('[ImageProcessor] sharp convertStickerToImage error:', err.message);
  }

  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `in_toimg_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`);
  const outputPath = path.join(tmpDir, `out_toimg_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);

  try {
    await fs.promises.writeFile(inputPath, buffer);
    await execAsync(`ffmpeg -y -vcodec webp -i "${inputPath}" -q:v 2 "${outputPath}"`);
    const jpgBuf = await fs.promises.readFile(outputPath);
    return jpgBuf;
  } catch (err: any) {
    console.warn('[ImageProcessor] FFmpeg convertStickerToImage fallback error:', err.message);
    return buffer;
  } finally {
    try { await fs.promises.unlink(inputPath); } catch (_) {}
    try { await fs.promises.unlink(outputPath); } catch (_) {}
  }
}

/**
 * Converts Video or Audio Buffer into MP3 Audio Buffer (.toaudio)
 */
export async function convertMediaToAudioMp3(buffer: Buffer): Promise<Buffer> {
  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `in_audio_${Date.now()}_${Math.random().toString(36).substring(7)}`);
  const outputPath = path.join(tmpDir, `out_audio_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`);

  try {
    await fs.promises.writeFile(inputPath, buffer);
    await execAsync(`ffmpeg -y -i "${inputPath}" -vn -c:a libmp3lame -b:a 192k "${outputPath}"`);
    const mp3Buffer = await fs.promises.readFile(outputPath);
    return mp3Buffer;
  } catch (err: any) {
    console.warn('[ImageProcessor] convertMediaToAudioMp3 error:', err.message);
    return buffer;
  } finally {
    try { await fs.promises.unlink(inputPath); } catch (_) {}
    try { await fs.promises.unlink(outputPath); } catch (_) {}
  }
}

/**
 * Convert any Audio (MP3, AAC, M4A) or Buffer to Official WhatsApp Voice Note (OGG Opus Mono 48kHz)
 */
export async function convertToWhatsAppVoiceNote(input: Buffer | string): Promise<{ buffer: Buffer; mimetype: string }> {
  const tempId = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const tempIn = path.join(os.tmpdir(), `vn_in_${tempId}`);
  const tempOut = path.join(os.tmpdir(), `vn_out_${tempId}.ogg`);

  try {
    let inPath = '';
    if (Buffer.isBuffer(input)) {
      await fs.promises.writeFile(tempIn, input);
      inPath = tempIn;
    } else if (typeof input === 'string' && fs.existsSync(input)) {
      inPath = input;
    }

    if (inPath) {
      await execAsync(`ffmpeg -y -i "${inPath}" -vn -map_metadata -1 -c:a libopus -b:a 48k -ar 48000 -ac 1 -application voip -frame_duration 20 -f ogg "${tempOut}"`);

      if (fs.existsSync(tempOut)) {
        const oggBuf = await fs.promises.readFile(tempOut);
        if (oggBuf.length > 200) {
          return {
            buffer: oggBuf,
            mimetype: 'audio/ogg; codecs=opus'
          };
        }
      }
    }
  } catch (err: any) {
    console.warn('[ImageProcessor] FFmpeg Opus conversion fallback:', err.message);
  } finally {
    try { if (fs.existsSync(tempIn)) await fs.promises.unlink(tempIn); } catch (e) {}
    try { if (fs.existsSync(tempOut)) await fs.promises.unlink(tempOut); } catch (e) {}
  }

  throw new Error('Gagal mengonversi audio ke format voice note.');
}
export async function applyAudioEffect(buffer: Buffer, effectName: string): Promise<Buffer> {
  const tmpDir = os.tmpdir();
  const id = Date.now() + '_' + Math.random().toString(36).substring(7);
  const inputPath = path.join(tmpDir, `in_effect_${id}`);
  const outputPath = path.join(tmpDir, `out_effect_${id}.mp3`);

  const effectFilters: Record<string, string> = {
    bass: '-af "equalizer=f=40:width_type=h:width=50:g=15,equalizer=f=100:width_type=h:width=100:g=10"',
    bassboost: '-af "equalizer=f=40:width_type=h:width=50:g=18,equalizer=f=100:width_type=h:width=100:g=12"',
    deep: '-af "asetrate=44100*0.75,aresample=44100"',
    earrape: '-af "volume=20,equalizer=f=1000:width_type=h:width=200:g=15"',
    blown: '-af "volume=25,equalizer=f=800:width_type=h:width=250:g=20"',
    echo: '-af "aecho=0.8:0.88:60:0.4"',
    fast: '-af "atempo=1.5"',
    speed: '-af "atempo=1.5"',
    nightcore: '-af "asetrate=44100*1.25,aresample=44100,atempo=1.1"',
    reverse: '-af "areverse"',
    robot: '-af "asetrate=44100*0.8,aresample=44100,vibrato=f=20:d=0.5"',
    slow: '-af "atempo=0.82,aecho=0.8:0.88:50:0.3"',
    slowed: '-af "atempo=0.82,aecho=0.8:0.88:50:0.3"',
    '8bit': '-af "aresample=8000,lowpass=f=3000"',
    helium: '-af "asetrate=44100*1.5,aresample=44100,atempo=0.85"',
    smooth: '-af "lowpass=f=3000,highpass=f=200"',
    vibrato: '-af "vibrato=f=7:d=0.5"',
    flanger: '-af "flanger"'
  };

  const filterCmd = effectFilters[effectName.toLowerCase()] || '-af "atempo=1.0"';

  try {
    await fs.promises.writeFile(inputPath, buffer);
    await execAsync(`ffmpeg -y -i "${inputPath}" ${filterCmd} -c:a libmp3lame -b:a 192k "${outputPath}"`);
    const processedBuf = await fs.promises.readFile(outputPath);
    return processedBuf;
  } catch (err: any) {
    console.warn(`[ImageProcessor] applyAudioEffect (${effectName}) error:`, err.message);
    return buffer;
  } finally {
    try { await fs.promises.unlink(inputPath); } catch (_) {}
    try { await fs.promises.unlink(outputPath); } catch (_) {}
  }
}

/**
 * Converts animated WebP sticker or Video Buffer to MP4 Video Buffer (.tovideo)
 */
export async function convertStickerToMp4Video(buffer: Buffer): Promise<Buffer> {
  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `in_tovideo_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`);
  const outputPath = path.join(tmpDir, `out_tovideo_${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`);

  try {
    await fs.promises.writeFile(inputPath, buffer);
    await execAsync(`ffmpeg -y -i "${inputPath}" -movflags +faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${outputPath}"`);
    const mp4Buffer = await fs.promises.readFile(outputPath);
    return mp4Buffer;
  } catch (err: any) {
    console.warn('[ImageProcessor] convertStickerToMp4Video error:', err.message);
    return buffer;
  } finally {
    try { await fs.promises.unlink(inputPath); } catch (_) {}
    try { await fs.promises.unlink(outputPath); } catch (_) {}
  }
}

/**
 * Enhances image resolution & sharpness via Lanczos 4K Unsharp Filter
 */
export async function enhanceImageSharpness(buffer: Buffer): Promise<Buffer> {
  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `in_hd_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);
  const outputPath = path.join(tmpDir, `out_hd_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);

  try {
    await fs.promises.writeFile(inputPath, buffer);

    // Lanczos 4K resampling (2048px min) + unsharp mask + contrast & saturation optimization
    const cmd = `ffmpeg -y -i "${inputPath}" -vf "scale='max(2048,iw*2)':-1:flags=lanczos,unsharp=5:5:1.8:5:5:0.0,eq=contrast=1.12:brightness=0.005:saturation=1.08" -q:v 2 "${outputPath}"`;

    await execAsync(cmd);
    const hdBuffer = await fs.promises.readFile(outputPath);
    return hdBuffer;
  } catch (err: any) {
    console.warn('[ImageProcessor] enhanceImageSharpness error:', err.message);
    return buffer;
  } finally {
    try { await fs.promises.unlink(inputPath); } catch (_) {}
    try { await fs.promises.unlink(outputPath); } catch (_) {}
  }
}

/**
 * Uploads image buffer to temporary storage to obtain a public URL
 */
export async function uploadImageBufferToHost(buffer: Buffer): Promise<string | null> {
  try {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], { type: 'image/jpeg' });
    formData.append('file', blob, 'image.jpg');

    const res = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const json: any = await res.json();
      if (json && json.data && json.data.url) {
        return json.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
      }
    }
  } catch (err: any) {
    console.warn('[ImageProcessor] tmpfiles upload error:', err.message);
  }

  return null;
}

/**
 * Full HD Ultra 4K Upscaler Engine
 */
export async function processHdImage(buffer: Buffer): Promise<Buffer> {
  let processedBuf = buffer;

  const publicUrl = await uploadImageBufferToHost(buffer);
  if (publicUrl) {
    const upscaleApis = [
      `https://api.aetherz.xyz/api/remini?url=${encodeURIComponent(publicUrl)}`,
      `https://btch.api.lol/upscale?url=${encodeURIComponent(publicUrl)}`,
      `https://api.siputzx.my.id/api/tools/remini?url=${encodeURIComponent(publicUrl)}`
    ];

    for (const api of upscaleApis) {
      try {
        const res = await fetch(api, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('image')) {
          const arrayBuf = await res.arrayBuffer();
          const apiBuf = Buffer.from(arrayBuf);
          if (apiBuf.length > 2000) {
            processedBuf = apiBuf;
            break;
          }
        } else if (res.ok) {
          const json: any = await res.json();
          const imgUrl = json?.url || json?.result || json?.data?.url || json?.data;
          if (typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
            const imgRes = await fetch(imgUrl);
            if (imgRes.ok) {
              const arrayBuf = await imgRes.arrayBuffer();
              const apiBuf = Buffer.from(arrayBuf);
              if (apiBuf.length > 2000) {
                processedBuf = apiBuf;
                break;
              }
            }
          }
        }
      } catch (err: any) {
        console.warn(`[ImageProcessor] Upscale API error (${api.slice(0, 30)}):`, err.message);
      }
    }
  }

  const ultraHdBuffer = await enhanceImageSharpness(processedBuf);
  return ultraHdBuffer;
}

/**
 * Extracts the text content of a quoted/replied message if the user replied to a message
 */
export function getQuotedTextFromCtx(m: any): string | null {
  if (!m || !m.message) return null;

  const msg = m.message.ephemeralMessage?.message ||
              m.message.viewOnceMessage?.message ||
              m.message.viewOnceMessageV2?.message ||
              m.message;

  const contextInfo = msg.extendedTextMessage?.contextInfo ||
                      msg.imageMessage?.contextInfo ||
                      msg.videoMessage?.contextInfo ||
                      msg.buttonsResponseMessage?.contextInfo ||
                      msg.templateButtonReplyMessage?.contextInfo ||
                      msg.listResponseMessage?.contextInfo ||
                      msg.interactiveResponseMessage?.contextInfo ||
                      msg.conversation?.contextInfo;

  const quotedMsg = contextInfo?.quotedMessage;
  if (!quotedMsg) return null;

  const unwrapped = quotedMsg.ephemeralMessage?.message ||
                    quotedMsg.viewOnceMessage?.message ||
                    quotedMsg.viewOnceMessageV2?.message ||
                    quotedMsg;

  const text = unwrapped.conversation ||
               unwrapped.extendedTextMessage?.text ||
               unwrapped.imageMessage?.caption ||
               unwrapped.videoMessage?.caption ||
               unwrapped.documentMessage?.caption ||
               '';

  return text ? text.trim() : null;
}
