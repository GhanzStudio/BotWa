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
      browser: Browsers.ubuntu('Chrome'),
      syncFullHistory: false,
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: false,
      connectTimeoutMs: 45000,
      keepAliveIntervalMs: 25000,
      retryRequestDelayMs: 3000
    });

    sockInstance = sock;

    // Pairing Code flow for Multi-Device
    if (phoneNumberForPairing && !sock.authState.creds.registered) {
      setTimeout(async () => {
        try {
          const cleanPhone = phoneNumberForPairing.replace(/\D/g, '');
          const code = await sock.requestPairingCode(cleanPhone);
          botState.pairingCode = code;
          botState.status = 'PAIRING_READY';
          console.log(`
┌──────────────────────────────────────────────────┐
│  🔑 KODE PAIRING WHATSAPP: ${code}              
│  Nomor: ${cleanPhone}                            
│  👉 Buka WA > Titik 3 > Perangkat Tertaut       
│     > Tautkan Perangkat > Tautkan dg nomor      
└──────────────────────────────────────────────────┘
`);
        } catch (err: any) {
          console.warn('[BAILEYS] Permintaan pairing code:', err.message);
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
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        botState.status = 'DISCONNECTED';
        botState.errorMessage = statusCode ? `Status ${statusCode}` : 'Koneksi terputus';

        if (shouldReconnect) {
          botState.reconnectAttempts += 1;
          if (botState.reconnectAttempts <= 3) {
            const delay = Math.min(30000, 4000 * botState.reconnectAttempts);
            setTimeout(() => {
              startBaileysBot();
            }, delay);
          }
        }
      } else if (connection === 'open') {
        botState.status = 'CONNECTED';
        botState.qrCodeUrl = null;
        botState.pairingCode = null;
        botState.lastConnected = new Date();
        botState.reconnectAttempts = 0;
        console.log(`[BAILEYS] ✅ Bot terhubung ke WhatsApp Multi-Device!`);
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
