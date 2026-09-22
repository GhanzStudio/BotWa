/**
 * Baileys Multi-Device WhatsApp Socket Manager
 * Handles socket lifecycle, QR pairing, reconnection, auto-typing, and event streams.
 */

import { Boom } from '@hapi/boom';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { config } from '../config.ts';
import { handleIncomingMessage } from './handler.ts';

export type BotConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'SCAN_QR' | 'CONNECTED' | 'PAIRING_READY';

interface BotState {
  status: BotConnectionStatus;
  qrCodeUrl: string | null;
  pairingCode: string | null;
  lastConnected: Date | null;
  errorMessage: string | null;
  reconnectAttempts: number;
}

export const botState: BotState = {
  status: 'DISCONNECTED',
  qrCodeUrl: null,
  pairingCode: null,
  lastConnected: null,
  errorMessage: null,
  reconnectAttempts: 0
};

let sockInstance: any = null;

export async function requestPairingCodeDirectly(rawPhoneNumber: string): Promise<string> {
  let cleanPhone = rawPhoneNumber.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  } else if (cleanPhone.startsWith('8')) {
    cleanPhone = '62' + cleanPhone;
  }

  // Clear uncompleted session files before new pairing attempt
  const sessionPath = path.resolve(process.cwd(), config.sessionDir || './sessions');
  const credsFile = path.join(sessionPath, 'creds.json');
  if (fs.existsSync(sessionPath)) {
    let isRegistered = false;
    if (fs.existsSync(credsFile)) {
      try {
        const creds = JSON.parse(fs.readFileSync(credsFile, 'utf-8'));
        if (creds.registered && creds.me) isRegistered = true;
      } catch (_) {}
    }
    if (!isRegistered) {
      console.log('[BAILEYS] 🧹 Membersihkan sisa pairing sebelumnya untuk kode baru...');
      try {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        fs.mkdirSync(sessionPath, { recursive: true });
      } catch (_) {}
    }
  }

  botState.pairingCode = null;
  botState.status = 'CONNECTING';

  await startBaileysBot(cleanPhone);

  // Poll for generated pairing code (up to 15 seconds)
  for (let i = 0; i < 30; i++) {
    if (botState.pairingCode) {
      return botState.pairingCode;
    }
    await new Promise(r => setTimeout(r, 500));
  }

  throw new Error('Waktu permintaan kode pairing habis (timeout). Silakan periksa koneksi internet Termux dan coba lagi.');
}

export async function startBaileysBot(phoneNumberForPairing?: string): Promise<any> {
  try {
    if (sockInstance) {
      try {
        sockInstance.ev?.removeAllListeners('connection.update');
        sockInstance.ev?.removeAllListeners('creds.update');
        sockInstance.ev?.removeAllListeners('messages.upsert');
        sockInstance.end?.();
      } catch (_) {}
      sockInstance = null;
    }

    botState.status = 'CONNECTING';
    botState.errorMessage = null;

    const sessionPath = path.resolve(process.cwd(), config.sessionDir || './sessions');
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    let version = [2, 3000, 1015901307];
    try {
      const fetched = await fetchLatestBaileysVersion();
      if (fetched?.version) version = fetched.version;
    } catch (_) {}

    const sock = makeWASocket({
      logger: pino({ level: 'silent' }),
      version: version as any,
      auth: state,
      printQRInTerminal: false,
      browser: Browsers.macOS('Desktop'),
      syncFullHistory: false,
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 30000,
      retryRequestDelayMs: 3000,
      getMessage: async () => ({
        conversation: 'P'
      })
    });

    sockInstance = sock;

    // Pairing Code flow for Multi-Device
    if (phoneNumberForPairing && !sock.authState.creds.registered) {
      setTimeout(async () => {
        try {
          let cleanPhone = phoneNumberForPairing.replace(/\D/g, '');
          if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
          else if (cleanPhone.startsWith('8')) cleanPhone = '62' + cleanPhone;

          const code = await sock.requestPairingCode(cleanPhone);
          botState.pairingCode = code;
          botState.status = 'PAIRING_READY';
          const formatted = code ? code.match(/.{1,4}/g)?.join('-') : code;
          console.log(`
┌──────────────────────────────────────────────────┐
│  🔑 KODE PAIRING WHATSAPP: ${formatted}              
│  Nomor: +${cleanPhone}                            
│  👉 Buka WA > Titik 3 > Perangkat Tertaut       
│     > Tautkan Perangkat > Tautkan dg nomor      
└──────────────────────────────────────────────────┘
`);
        } catch (err: any) {
          console.warn('[BAILEYS] Permintaan pairing code:', err.message);
          botState.errorMessage = `Gagal pairing: ${err.message}`;
        }
      }, 3000);
    }

    // Credentials update handler
    sock.ev.on('creds.update', saveCreds);

    // Connection state update handler
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        botState.status = 'SCAN_QR';
        try {
          botState.qrCodeUrl = await QRCode.toDataURL(qr);
        } catch (e) {
          botState.qrCodeUrl = null;
        }
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        console.log(`[BAILEYS] Koneksi terputus. Status code: ${statusCode}`);

        // Handle WhatsApp 515 restartRequired (Crucial for Pairing Code handshake)
        if (statusCode === 515 || statusCode === DisconnectReason.restartRequired) {
          console.log('[BAILEYS] 🔄 Handshake pairing diterima (Restart Required 515). Menyambungkan sesi otomatis...');
          startBaileysBot();
          return;
        }

        const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== 401;
        botState.status = 'DISCONNECTED';
        botState.errorMessage = statusCode ? `Status ${statusCode}` : 'Koneksi terputus';

        if (shouldReconnect) {
          botState.reconnectAttempts += 1;
          if (botState.reconnectAttempts <= 5) {
            const delay = Math.min(20000, 3000 * botState.reconnectAttempts);
            console.log(`[BAILEYS] Mencoba menyambung ulang dalam ${delay / 1000} detik...`);
            setTimeout(() => {
              startBaileysBot();
            }, delay);
          }
        } else {
          console.log('[BAILEYS] ℹ️ Sesi WhatsApp belum terhubung atau telah dikeluarkan (Status 401).');
          console.log('👉 Buka di Chrome: \x1b[1;32mhttp://localhost:3000/lite\x1b[0m untuk menautkan nomor WhatsApp Anda.');
          console.log('👉 Atau jalankan di terminal: \x1b[1;33mnode pair.js\x1b[0m\n');
          // Bersihkan file sesi yang kedaluwarsa agar siap untuk sesi baru
          try {
            fs.rmSync(sessionPath, { recursive: true, force: true });
            fs.mkdirSync(sessionPath, { recursive: true });
          } catch (_) {}
        }
      } else if (connection === 'open') {
        botState.status = 'CONNECTED';
        botState.qrCodeUrl = null;
        botState.pairingCode = null;
        botState.lastConnected = new Date();
        botState.reconnectAttempts = 0;
        console.log(`[BAILEYS] ✅ Bot BERHASIL TERHUBUNG ke WhatsApp Multi-Device!`);
      }
    });

    // Messages Upsert (Incoming messages)
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;
      for (const msg of messages) {
        if (!msg.message) continue;
        if (msg.key && msg.key.remoteJid === 'status@broadcast') continue;

        const senderJid = msg.key.remoteJid || '';
        const isGroup = senderJid.endsWith('@g.us');
        const participant = msg.key.participant || (isGroup ? senderJid : '');
        const pushName = msg.pushName || 'Pengguna';

        // Auto-read feature toggle
        if (config.autoRead) {
          await sock.readMessages([msg.key]);
        }

        // Extract message body
        const content = msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          msg.message.videoMessage?.caption || '';

        if (!content) continue;

        // Auto-typing feature toggle
        if (config.autoTyping && content.startsWith(config.prefix)) {
          await sock.sendPresenceUpdate('composing', senderJid);
        }

        // Dispatch to handler
        await handleIncomingMessage({
          sock,
          m: msg,
          senderJid: isGroup ? participant : senderJid,
          senderName: pushName,
          groupJid: isGroup ? senderJid : undefined,
          body: content,
          sendReply: async (text: string, options?: any) => {
            return await sock.sendMessage(senderJid, { text, ...options }, { quoted: msg });
          },
          sendReaction: async (emoji: string) => {
            return await sock.sendMessage(senderJid, {
              react: { text: emoji, key: msg.key }
            });
          }
        });
      }
    });

    return sock;
  } catch (err: any) {
    botState.status = 'DISCONNECTED';
    botState.errorMessage = err.message;
    console.error('[BAILEYS] Error memulai socket:', err);
    return null;
  }
}

export function getBotState() {
  return {
    ...botState,
    botName: config.botName,
    prefix: config.prefix,
    ownerNumber: config.ownerNumber,
    ownerName: config.ownerName
  };
}

export function getSockInstance() {
  return sockInstance;
}
