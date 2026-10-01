/**
 * WhatsApp Multi-Device LID (Linked Identity / Account ID) to Real Phone Number Resolver
 * Memetakan ID internal WhatsApp Web / Multi-Device (@lid) ke Nomor Telepon Asli (MSISDN)
 * Sehingga nomor HP dan ID akun ditampilkan secara tepat dan terpisah.
 */

import fs from 'fs';
import path from 'path';
import { config } from '../config.ts';

export interface ResolvedWaIdentity {
  phoneNumber: string;       // Nomor HP murni numerik (misal: "6287891284460")
  formattedPhone: string;    // Nomor HP terformat (misal: "+62 878-9128-4460")
  jid: string;               // JID WhatsApp (misal: "6287891284460@s.whatsapp.net")
  lid?: string;              // ID WhatsApp Multi-Device (misal: "56106063794223@lid")
  isLidInput: boolean;       // Menandakan apakah input awalnya merupakan LID
}

// In-memory cache untuk performa tinggi
const lidToPhoneCache = new Map<string, string>();
const phoneToLidCache = new Map<string, string>();

// Prapopulasi pemetaan tetap untuk Owner & Bot
const OWNER_PHONE = (config.ownerNumber || '6287891284460').replace(/\D/g, '');
const OWNER_LID = '56106063794223';
const BOT_PHONE = '6287817697830';
const BOT_LID = '71138164121678';

lidToPhoneCache.set(OWNER_LID, OWNER_PHONE);
phoneToLidCache.set(OWNER_PHONE, `${OWNER_LID}@lid`);

lidToPhoneCache.set(BOT_LID, BOT_PHONE);
phoneToLidCache.set(BOT_PHONE, `${BOT_LID}@lid`);

/**
 * Format nomor telepon Indonesia / Internasional agar rapi dan mudah dibaca
 */
export function formatPhoneNumber(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (!clean) return '';
  if (clean.startsWith('62')) {
    if (clean.length >= 11) {
      return `+62 ${clean.slice(2, 5)}-${clean.slice(5, 9)}-${clean.slice(9)}`;
    }
    return `+62 ${clean.slice(2)}`;
  }
  return `+${clean}`;
}

/**
 * Memecahkan identitas WhatsApp (JID, LID, nomor telepon) menjadi nomor telepon asli dan ID LID
 */
export function resolveRealPhoneNumber(input: string): ResolvedWaIdentity {
  if (!input) {
    return {
      phoneNumber: OWNER_PHONE,
      formattedPhone: formatPhoneNumber(OWNER_PHONE),
      jid: `${OWNER_PHONE}@s.whatsapp.net`,
      lid: `${OWNER_LID}@lid`,
      isLidInput: false
    };
  }

  const raw = String(input).trim();
  const hasLidSuffix = raw.endsWith('@lid');
  const cleanDigits = raw.split('@')[0].split(':')[0].replace(/\D/g, '');

  let resolvedPhone = cleanDigits;
  let resolvedLid: string | undefined = hasLidSuffix ? `${cleanDigits}@lid` : undefined;
  let isLid = hasLidSuffix;

  // 1. Cek cache memori
  if (lidToPhoneCache.has(cleanDigits)) {
    resolvedPhone = lidToPhoneCache.get(cleanDigits)!;
    resolvedLid = `${cleanDigits}@lid`;
    isLid = true;
  } else {
    // 2. Cek berkas mapping sesi Baileys (lid-mapping-<cleanDigits>_reverse.json)
    try {
      const sessionDir = path.resolve(process.cwd(), config.sessionDir || './sessions');
      const reverseFile = path.join(sessionDir, `lid-mapping-${cleanDigits}_reverse.json`);
      if (fs.existsSync(reverseFile)) {
        const fileContent = JSON.parse(fs.readFileSync(reverseFile, 'utf-8'));
        if (typeof fileContent === 'string') {
          const extractedPhone = fileContent.replace(/\D/g, '');
          if (extractedPhone) {
            resolvedPhone = extractedPhone;
            resolvedLid = `${cleanDigits}@lid`;
            isLid = true;
            lidToPhoneCache.set(cleanDigits, extractedPhone);
            phoneToLidCache.set(extractedPhone, `${cleanDigits}@lid`);
          }
        }
      }
    } catch (_) {}

    // 3. Cek creds.json untuk bot me lid
    if (!isLid) {
      try {
        const sessionDir = path.resolve(process.cwd(), config.sessionDir || './sessions');
        const credsFile = path.join(sessionDir, 'creds.json');
        if (fs.existsSync(credsFile)) {
          const creds = JSON.parse(fs.readFileSync(credsFile, 'utf-8'));
          const myLid = creds?.me?.lid?.split('@')[0]?.split(':')[0]?.replace(/\D/g, '');
          const myPhone = creds?.me?.id?.split('@')[0]?.split(':')[0]?.replace(/\D/g, '');
          if (myLid && myPhone) {
            lidToPhoneCache.set(myLid, myPhone);
            phoneToLidCache.set(myPhone, `${myLid}@lid`);
            if (cleanDigits === myLid) {
              resolvedPhone = myPhone;
              resolvedLid = `${myLid}@lid`;
              isLid = true;
            }
          }
        }
      } catch (_) {}
    }
  }

  // 4. Normalisasi nomor telepon jika diawali 08 atau 8
  if (resolvedPhone.startsWith('08')) {
    resolvedPhone = '62' + resolvedPhone.slice(1);
  } else if (resolvedPhone.startsWith('8') && resolvedPhone.length >= 10) {
    resolvedPhone = '62' + resolvedPhone;
  }

  // 5. Jika belum memiliki info LID tapi input adalah nomor telepon, cari forward mapping
  if (!resolvedLid) {
    if (phoneToLidCache.has(resolvedPhone)) {
      resolvedLid = phoneToLidCache.get(resolvedPhone);
    } else {
      try {
        const sessionDir = path.resolve(process.cwd(), config.sessionDir || './sessions');
        const forwardFile = path.join(sessionDir, `lid-mapping-${resolvedPhone}.json`);
        if (fs.existsSync(forwardFile)) {
          const fileContent = JSON.parse(fs.readFileSync(forwardFile, 'utf-8'));
          if (typeof fileContent === 'string') {
            const lidDigits = fileContent.replace(/\D/g, '');
            if (lidDigits) {
              resolvedLid = `${lidDigits}@lid`;
              phoneToLidCache.set(resolvedPhone, resolvedLid);
              lidToPhoneCache.set(lidDigits, resolvedPhone);
            }
          }
        }
      } catch (_) {}
    }
  }

  // Khusus nomor Owner
  if (resolvedPhone === OWNER_PHONE || cleanDigits === OWNER_LID) {
    resolvedPhone = OWNER_PHONE;
    resolvedLid = `${OWNER_LID}@lid`;
  }

  return {
    phoneNumber: resolvedPhone,
    formattedPhone: formatPhoneNumber(resolvedPhone),
    jid: `${resolvedPhone}@s.whatsapp.net`,
    lid: resolvedLid,
    isLidInput: isLid
  };
}
