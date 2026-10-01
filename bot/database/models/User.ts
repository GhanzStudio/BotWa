/**
 * User Model Schema
 * Handles user profile, level, exp, balance (koin), limit/energi, roles, and ban status.
 */

import mongoose, { Schema, Document } from 'mongoose';
import { config, isOwnerNumber } from '../../config.ts';
import { resolveRealPhoneNumber } from '../../lib/lidResolver.ts';
import fs from 'fs';
import path from 'path';

export interface IUser extends Document {
  id: string; // WhatsApp JID (e.g. 628xxx@s.whatsapp.net)
  name: string;
  exp: number;
  level: number;
  koin: number;
  limit: number;
  lastDaily: Date | null;
  lastWeekly: Date | null;
  role: 'user' | 'partner' | 'premium' | 'owner';
  premium: boolean;
  premiumExpired: Date | null;
  registered: boolean;
  registeredAt: Date | null;
  age: number;
  birthday: string | null;
  banned: boolean;
  banReason: string | null;
  warn: number;
  totalHit: number;
  termsAccepted: boolean;
  termsAcceptedAt: Date | null;
  registeredRegion: string | null;
  ownerApproved18: boolean;
}

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  name: { type: String, default: 'User' },
  exp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  koin: { type: Number, default: 1000 },
  limit: { type: Number, default: 50 },
  lastDaily: { type: Date, default: null },
  lastWeekly: { type: Date, default: null },
  role: { type: String, enum: ['user', 'partner', 'premium', 'owner'], default: 'user' },
  premium: { type: Boolean, default: false },
  premiumExpired: { type: Date, default: null },
  registered: { type: Boolean, default: false },
  registeredAt: { type: Date, default: null },
  age: { type: Number, default: 0 },
  birthday: { type: String, default: null },
  banned: { type: Boolean, default: false },
  banReason: { type: String, default: null },
  warn: { type: Number, default: 0 },
  totalHit: { type: Number, default: 0 },
  termsAccepted: { type: Boolean, default: false },
  termsAcceptedAt: { type: Date, default: null },
  registeredRegion: { type: String, default: null },
  ownerApproved18: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// In-memory fallback map for offline operations
const memoryUsers = new Map<string, any>();
const DATA_DIR = path.resolve(process.cwd(), './data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PREM_FILE = path.join(DATA_DIR, 'premium_numbers.json');
const SCANNED_FILE = path.join(DATA_DIR, 'scanned_users.json');
const OWNERS_FILE = path.join(DATA_DIR, 'owners.json');
const APPROVED18_USERS_FILE = path.join(DATA_DIR, 'approved18_users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (_) {}
}

// Persistent Pre-approved / Saved Premium Numbers Set
const premiumNumbersList = new Set<string>();
// Persistent Pre-approved Owners Set
const ownerNumbersList = new Set<string>(['6287891284460']);
// Persistent 18+ Approved Users Set
const approved18UsersList = new Set<string>();
// Persistent Scanned QR Users Map
const scannedUsersMap = new Map<string, any>();

function loadPersistedData() {
  // Load owners
  try {
    if (fs.existsSync(OWNERS_FILE)) {
      const savedOwners = JSON.parse(fs.readFileSync(OWNERS_FILE, 'utf-8'));
      if (Array.isArray(savedOwners)) {
        for (const num of savedOwners) {
          const clean = String(num).replace(/\D/g, '');
          if (clean) ownerNumbersList.add(clean);
        }
      }
    }
  } catch (err: any) {
    console.warn('[User] Gagal membaca file owners.json:', err.message);
  }

  // Load auto-premium numbers
  try {
    if (fs.existsSync(PREM_FILE)) {
      const savedPrems = JSON.parse(fs.readFileSync(PREM_FILE, 'utf-8'));
      if (Array.isArray(savedPrems)) {
        for (const num of savedPrems) {
          const clean = String(num).replace(/\D/g, '');
          if (clean) premiumNumbersList.add(clean);
        }
      }
    }
  } catch (err: any) {
    console.warn('[User] Gagal membaca file premium_numbers.json:', err.message);
  }

  // Load approved 18+ user numbers
  try {
    if (fs.existsSync(APPROVED18_USERS_FILE)) {
      const saved18Users = JSON.parse(fs.readFileSync(APPROVED18_USERS_FILE, 'utf-8'));
      if (Array.isArray(saved18Users)) {
        for (const num of saved18Users) {
          const clean = String(num).replace(/\D/g, '');
          if (clean) approved18UsersList.add(clean);
        }
      }
    }
  } catch (err: any) {
    console.warn('[User] Gagal membaca file approved18_users.json:', err.message);
  }

  // Load scanned WA Web users
  try {
    if (fs.existsSync(SCANNED_FILE)) {
      const savedScanned = JSON.parse(fs.readFileSync(SCANNED_FILE, 'utf-8'));
      if (Array.isArray(savedScanned)) {
        for (const sc of savedScanned) {
          if (sc.jid || sc.number) {
            const key = (sc.number || sc.jid.split('@')[0]).replace(/\D/g, '');
            scannedUsersMap.set(key, sc);
          }
        }
      }
    }
  } catch (err: any) {
    console.warn('[User] Gagal membaca file scanned_users.json:', err.message);
  }

  // Load users database
  try {
    if (fs.existsSync(USERS_FILE)) {
      const savedUsers = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      if (Array.isArray(savedUsers)) {
        for (const u of savedUsers) {
          if (u.id) {
            const idDigits = u.id.split('@')[0].split(':')[0].replace(/\D/g, '');
            const genuineOwner = isOwnerNumber(idDigits) || ownerNumbersList.has(idDigits);
            if (u.role === 'owner' && !genuineOwner) {
              const isPrem = premiumNumbersList.has(idDigits);
              u.role = isPrem ? 'premium' : 'user';
              u.premium = isPrem;
              if (!isPrem) {
                u.limit = 50;
                u.level = 1;
                u.koin = 1000;
                u.exp = 0;
              }
              if (u.name === config.ownerName) {
                u.name = 'Pengguna';
              }
            }
            u.save = async function() {
              savePersistedUsers();
              return this;
            };
            memoryUsers.set(u.id, u);
          }
        }
      }
    }
  } catch (err: any) {
    console.warn('[User] Gagal membaca file users.json:', err.message);
  }
}

// Initialize on startup
loadPersistedData();

export function savePersistedUsers() {
  try {
    const list = Array.from(memoryUsers.values()).map(u => {
      const copy = { ...u };
      delete copy.save;
      return copy;
    });
    fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2));
  } catch (err: any) {
    console.warn('[User] Gagal menyimpan data users.json:', err.message);
  }
}

export function savePersistedPremiumNumbers() {
  try {
    const list = Array.from(premiumNumbersList);
    fs.writeFileSync(PREM_FILE, JSON.stringify(list, null, 2));
  } catch (err: any) {
    console.warn('[User] Gagal menyimpan file premium_numbers.json:', err.message);
  }
}

export function savePersistedScannedUsers() {
  try {
    const list = Array.from(scannedUsersMap.values());
    fs.writeFileSync(SCANNED_FILE, JSON.stringify(list, null, 2));
  } catch (err: any) {
    console.warn('[User] Gagal menyimpan file scanned_users.json:', err.message);
  }
}

export function savePersistedOwners() {
  try {
    const list = Array.from(ownerNumbersList);
    fs.writeFileSync(OWNERS_FILE, JSON.stringify(list, null, 2));
  } catch (err: any) {
    console.warn('[User] Gagal menyimpan file owners.json:', err.message);
  }
}

export function savePersisted18Users() {
  try {
    const list = Array.from(approved18UsersList);
    fs.writeFileSync(APPROVED18_USERS_FILE, JSON.stringify(list, null, 2));
  } catch (err: any) {
    console.warn('[User] Gagal menyimpan file approved18_users.json:', err.message);
  }
}

/**
 * Menyimpan data pengguna yang scan QR Code WA Web / terhubung.
 */
export function recordScannedUser(jidOrNumber: string, name?: string, meta?: any): any {
  let cleanNumber = jidOrNumber.split('@')[0].split(':')[0].replace(/\D/g, '');
  if (cleanNumber.startsWith('08')) {
    cleanNumber = '62' + cleanNumber.slice(1);
  } else if (cleanNumber.startsWith('8')) {
    cleanNumber = '62' + cleanNumber;
  }
  const cleanJid = `${cleanNumber}@s.whatsapp.net`;
  const record = {
    jid: cleanJid,
    number: cleanNumber,
    name: name || 'Pengguna WhatsApp',
    scannedAt: new Date().toISOString(),
    device: meta?.device || 'Multi-Device WA Web',
    source: meta?.source || 'QR_CODE_SCAN',
    role: isOwnerNumber(cleanNumber) ? 'owner' : (isPersistentPremium(cleanNumber) ? 'premium' : 'user')
  };

  scannedUsersMap.set(cleanNumber, record);
  savePersistedScannedUsers();

  // Auto simpan / daftarkan ke database users utama
  getUser(cleanJid, name).then(u => {
    u.registered = true;
    u.registeredAt = new Date();
    u.save?.();
  }).catch(() => {});

  return record;
}

export function getScannedUsers(): any[] {
  return Array.from(scannedUsersMap.values());
}

export function isScannedUser(jidOrPhone: string): boolean {
  const identity = resolveRealPhoneNumber(jidOrPhone);
  return scannedUsersMap.has(identity.phoneNumber);
}

/**
 * Menambahkan nomor owner permanen
 */
export function addPersistentOwnerNumber(phoneNumber: string): { success: boolean; cleanNumber: string } {
  let clean = phoneNumber.replace(/\D/g, '');
  if (clean.startsWith('08')) clean = '62' + clean.slice(1);
  if (!clean) return { success: false, cleanNumber: '' };
  ownerNumbersList.add(clean);
  savePersistedOwners();

  const jid = `${clean}@s.whatsapp.net`;
  if (memoryUsers.has(jid)) {
    const u = memoryUsers.get(jid);
    u.role = 'owner';
    u.premium = true;
    u.limit = 999999;
    u.koin = 999999999;
    u.level = 999;
    savePersistedUsers();
  }
  return { success: true, cleanNumber: clean };
}

export function getPersistentOwnerNumbers(): string[] {
  return Array.from(ownerNumbersList);
}

export function isConfiguredOwner(jidOrPhone: string): boolean {
  const identity = resolveRealPhoneNumber(jidOrPhone);
  return isOwnerNumber(identity.phoneNumber) || isOwnerNumber(identity.jid) || ownerNumbersList.has(identity.phoneNumber);
}

/**
 * Mendaftarkan nomor sebagai Auto-Premium secara permanen.
 * Setiap kali nomor ini mengirim pesan/chat ke bot, sistem akan langsung
 * mengaktifkan status Premium (VIP) dengan limit unlimited dan akses penuh.
 */
export function addPersistentPremiumNumber(phoneNumber: string): { success: boolean; cleanNumber: string } {
  let clean = phoneNumber.replace(/\D/g, '');
  if (clean.startsWith('08')) {
    clean = '62' + clean.slice(1);
  } else if (clean.startsWith('8')) {
    clean = '62' + clean;
  }
  if (!clean) return { success: false, cleanNumber: '' };

  premiumNumbersList.add(clean);
  savePersistedPremiumNumbers();

  // Jika user sudah ada di memory, upgrade langsung
  const jid = `${clean}@s.whatsapp.net`;
  if (memoryUsers.has(jid)) {
    const u = memoryUsers.get(jid);
    u.premium = true;
    u.role = 'premium';
    u.limit = Math.max(u.limit || 0, 999999);
    savePersistedUsers();
  }

  return { success: true, cleanNumber: clean };
}

/**
 * Menghapus nomor dari daftar Auto-Premium permanen.
 */
export function removePersistentPremiumNumber(phoneNumber: string): { success: boolean; cleanNumber: string } {
  let clean = phoneNumber.replace(/\D/g, '');
  if (clean.startsWith('08')) {
    clean = '62' + clean.slice(1);
  } else if (clean.startsWith('8')) {
    clean = '62' + clean;
  }

  premiumNumbersList.delete(clean);
  savePersistedPremiumNumbers();

  const jid = `${clean}@s.whatsapp.net`;
  if (memoryUsers.has(jid)) {
    const u = memoryUsers.get(jid);
    if (u.role !== 'owner') {
      u.premium = false;
      u.role = 'user';
      savePersistedUsers();
    }
  }

  return { success: true, cleanNumber: clean };
}

/**
 * Mendapatkan seluruh daftar nomor Auto-Premium.
 */
export function getPersistentPremiumNumbers(): string[] {
  return Array.from(premiumNumbersList);
}

/**
 * Cek apakah sebuah nomor terdaftar dalam whitelist Auto-Premium.
 */
export function isPersistentPremium(jidOrPhone: string): boolean {
  const identity = resolveRealPhoneNumber(jidOrPhone);
  return premiumNumbersList.has(identity.phoneNumber);
}

/**
 * Mendaftarkan nomor pengguna yang disetujui untuk Akses 18+ secara permanen di database.
 */
export function addPersistent18User(phoneNumberOrJid: string): { success: boolean; cleanNumber: string } {
  let clean = phoneNumberOrJid.replace(/\D/g, '');
  if (clean.startsWith('08')) {
    clean = '62' + clean.slice(1);
  } else if (clean.startsWith('8')) {
    clean = '62' + clean;
  }
  if (!clean) return { success: false, cleanNumber: '' };

  approved18UsersList.add(clean);
  savePersisted18Users();

  const jid = `${clean}@s.whatsapp.net`;
  if (memoryUsers.has(jid)) {
    const u = memoryUsers.get(jid);
    u.ownerApproved18 = true;
    savePersistedUsers();
  }

  return { success: true, cleanNumber: clean };
}

/**
 * Mencabut persetujuan 18+ pengguna dari database.
 */
export function removePersistent18User(phoneNumberOrJid: string): { success: boolean; cleanNumber: string } {
  let clean = phoneNumberOrJid.replace(/\D/g, '');
  if (clean.startsWith('08')) {
    clean = '62' + clean.slice(1);
  } else if (clean.startsWith('8')) {
    clean = '62' + clean;
  }

  approved18UsersList.delete(clean);
  savePersisted18Users();

  const jid = `${clean}@s.whatsapp.net`;
  if (memoryUsers.has(jid)) {
    const u = memoryUsers.get(jid);
    u.ownerApproved18 = false;
    savePersistedUsers();
  }

  return { success: true, cleanNumber: clean };
}

export function getPersistent18Users(): string[] {
  return Array.from(approved18UsersList);
}

export function isPersistent18User(jidOrPhone: string): boolean {
  const identity = resolveRealPhoneNumber(jidOrPhone);
  return approved18UsersList.has(identity.phoneNumber) || approved18UsersList.has(identity.jid.split('@')[0]);
}

/**
 * FITUR SCAN NOMOR UNTUK .profile & .me:
 * Memindai nomor target secara langsung terhadap database:
 * 1. Membedakan Nomor Telepon Asli (MSISDN) dan ID Akun Multi-Device (LID WhatsApp Web)
 * 2. Jika nomor cocok dengan database Owner -> otomatis dijadikan OWNER (Super Admin)
 * 3. Jika nomor cocok dengan database Auto-Premium -> otomatis dijadikan PREMIUM (VIP)
 * 4. Jika cocok dengan user yang scan QR Web -> terverifikasi sebagai Pengguna Web
 * 5. Jika pengguna reguler -> profil standar
 * Mengembalikan hasil scan lengkap beserta kartu profil terbaru.
 */
export async function scanAndVerifyNumber(jidOrPhone: string, fallbackName?: string): Promise<{
  cleanNumber: string;
  cleanJid: string;
  formattedPhone: string;
  lid?: string;
  isLid: boolean;
  matchedType: 'OWNER' | 'PREMIUM' | 'SCANNED_USER' | 'REGULAR';
  statusLabel: string;
  verificationDetail: string;
  synchronizationMessage: string;
  user: any;
}> {
  const identity = resolveRealPhoneNumber(jidOrPhone);
  const cleanNumber = identity.phoneNumber;
  const cleanJid = identity.jid;
  const formattedPhone = identity.formattedPhone;
  const lid = identity.lid;
  const isLid = identity.isLidInput;

  const user = await getUser(cleanJid, fallbackName);
  const isOwnerMatch = isConfiguredOwner(cleanNumber) || isOwnerNumber(cleanJid);
  const isPremMatch = isPersistentPremium(cleanNumber);
  const isScannedMatch = isScannedUser(cleanNumber);

  let matchedType: 'OWNER' | 'PREMIUM' | 'SCANNED_USER' | 'REGULAR' = 'REGULAR';
  let statusLabel = '👤 USER REGULER';
  let verificationDetail = 'Nomor pengguna standar / reguler.';
  let synchronizationMessage = 'Status akun reguler tersinkronisasi.';

  if (isOwnerMatch) {
    matchedType = 'OWNER';
    statusLabel = '👑 OWNER (SUPER ADMIN)';
    verificationDetail = 'COCOK DENGAN DATABASE OWNER & DEVELOPER 👑';
    synchronizationMessage = 'Nomor cocok dengan Owner! Otomatis diangkat menjadi OWNER dengan Root Access & Limit Tanpa Batas! ✅';

    user.role = 'owner';
    user.premium = true;
    user.limit = 999999;
    user.koin = 999999999;
    user.level = 999;
    user.registered = true;
    user.banned = false;
    if (!user.name || user.name === 'User' || user.name === 'anonymous' || user.name === 'Pengguna') {
      user.name = config.ownerName || 'GhanzStudio';
    }
    await user.save?.();
  } else if (isPremMatch) {
    matchedType = 'PREMIUM';
    statusLabel = '👑 PREMIUM (VIP MEMBER)';
    verificationDetail = 'COCOK DENGAN DATABASE AUTO-PREMIUM 👑';
    synchronizationMessage = 'Nomor cocok dengan database Auto-Prem! Otomatis diaktifkan sebagai VIP PREMIUM dengan Limit Unlimited! ✨';

    user.role = 'premium';
    user.premium = true;
    user.limit = Math.max(user.limit || 0, 999999);
    user.koin = Math.max(user.koin || 0, 50000);
    user.level = Math.max(user.level || 0, 10);
    user.registered = true;
    if (!user.premiumExpired || new Date(user.premiumExpired) < new Date()) {
      user.premiumExpired = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }
    await user.save?.();
  } else if (isScannedMatch) {
    matchedType = 'SCANNED_USER';
    statusLabel = '📱 PENGGUNA TERVERIFIKASI (SCAN QR WA)';
    verificationDetail = 'COCOK DENGAN DATABASE SCAN QR CODE WA WEB ✅';
    synchronizationMessage = 'Nomor terhubung melalui WhatsApp Web dan tersimpan rapi di database pengguna reguler.';
    user.role = 'user';
    user.premium = false;
    if (user.limit > 1000) user.limit = 50;
    if (user.level > 50) user.level = 1;
    if (user.koin > 50000) user.koin = 1000;
    user.registered = true;
    await user.save?.();
  } else {
    matchedType = 'REGULAR';
    statusLabel = '👤 PENGGUNA STANDAR';
    verificationDetail = 'Terdaftar sebagai pengguna standar bot.';
    synchronizationMessage = 'Ketik .daftar untuk registrasi atau hubungi owner untuk upgrade VIP.';
    user.role = 'user';
    user.premium = false;
    if (user.limit > 1000) user.limit = 50;
    if (user.level > 50) user.level = 1;
    if (user.koin > 50000) user.koin = 1000;
    await user.save?.();
  }

  return {
    cleanNumber,
    cleanJid,
    formattedPhone,
    lid,
    isLid,
    matchedType,
    statusLabel,
    verificationDetail,
    synchronizationMessage,
    user
  };
}

export async function getUser(jid: string, name?: string): Promise<any> {
  const identity = resolveRealPhoneNumber(jid);
  const cleanJid = identity.jid;
  const isOwner = isConfiguredOwner(identity.phoneNumber) || isOwnerNumber(cleanJid);
  const isAutoPrem = isPersistentPremium(identity.phoneNumber) || isPersistentPremium(cleanJid);

  let user: any = null;

  try {
    if (mongoose.connection.readyState === 1) {
      user = await UserModel.findOne({ id: cleanJid });
      if (!user) {
        user = await UserModel.create({
          id: cleanJid,
          name: isOwner ? (name || config.ownerName || 'GhanzStudio') : (name || 'User'),
          limit: isOwner ? 999999 : (isAutoPrem ? 999999 : 50),
          koin: isOwner ? 999999999 : (isAutoPrem ? 50000 : 1000),
          exp: isOwner ? 99999 : (isAutoPrem ? 1000 : 0),
          level: isOwner ? 999 : (isAutoPrem ? 10 : 1),
          role: isOwner ? 'owner' : (isAutoPrem ? 'premium' : 'user'),
          premium: isOwner || isAutoPrem,
          registered: isOwner || isAutoPrem,
          registeredAt: (isOwner || isAutoPrem) ? new Date() : null
        });
      }
    }
  } catch (err) {
    // Fallback to memory
  }

  if (!user) {
    if (!memoryUsers.has(cleanJid)) {
      memoryUsers.set(cleanJid, {
        id: cleanJid,
        name: isOwner ? (name || config.ownerName || 'GhanzStudio') : (name || 'User'),
        exp: isOwner ? 99999 : (isAutoPrem ? 1000 : 0),
        level: isOwner ? 999 : (isAutoPrem ? 10 : 1),
        koin: isOwner ? 999999999 : (isAutoPrem ? 50000 : 1000),
        limit: isOwner ? 999999 : (isAutoPrem ? 999999 : 50),
        lastDaily: null,
        lastWeekly: null,
        role: isOwner ? 'owner' : (isAutoPrem ? 'premium' : 'user'),
        premium: isOwner || isAutoPrem,
        premiumExpired: isAutoPrem ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
        registered: isOwner || isAutoPrem,
        registeredAt: (isOwner || isAutoPrem) ? new Date() : null,
        age: isOwner ? 20 : 0,
        birthday: isOwner ? '17-08' : null,
        banned: false,
        banReason: null,
        warn: 0,
        totalHit: 0,
        save: async function() {
          savePersistedUsers();
          return this;
        }
      });
      savePersistedUsers();
    }
    user = memoryUsers.get(cleanJid);
  }

  // Enforce Auto-Premium jika nomor terdaftar dalam whitelist Auto-Premium
  if (isAutoPrem && user.role !== 'owner') {
    user.premium = true;
    user.role = 'premium';
    if (!user.premiumExpired || new Date(user.premiumExpired) < new Date()) {
      user.premiumExpired = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 tahun
    }
    if ((user.limit || 0) < 500) {
      user.limit = 999999;
    }
  }

  // Enforce status persetujuan 18+ user jika terdaftar di whitelist approved18_users.json / owner / premium
  const is18Whitelisted = isPersistent18User(identity.phoneNumber) || isPersistent18User(cleanJid) || isOwner || isAutoPrem;
  if (is18Whitelisted) {
    user.ownerApproved18 = true;
  }

  // Enforce Owner state HANYA jika nomor benar-benar match owner resmi
  if (isOwner) {
    user.role = 'owner';
    user.premium = true;
    user.limit = 999999;
    user.koin = 999999999;
    user.level = 999;
    user.registered = true;
    user.banned = false;
    if (!user.name || user.name === 'User' || user.name === 'GhanzTester' || user.name === 'anonymous' || user.name === 'Pengguna') {
      user.name = config.ownerName || 'GhanzStudio';
    }
  } else {
    // Self-healing: jika nomor BUKAN owner, pastikan status role owner dicabut jika sebelumnya salah tersimpan
    if (user.role === 'owner') {
      user.role = isAutoPrem ? 'premium' : 'user';
      user.premium = isAutoPrem;
      if (!isAutoPrem) {
        user.limit = (user.limit > 1000) ? 50 : (user.limit || 50);
        user.level = (user.level > 50) ? 1 : (user.level || 1);
        user.koin = (user.koin > 50000) ? 1000 : (user.koin || 1000);
        user.exp = (user.exp > 5000) ? 0 : (user.exp || 0);
      }
      if (user.name === config.ownerName) {
        user.name = name || 'Pengguna';
      }
      user.save?.();
    } else if (name && (user.name === 'User' || user.name === 'anonymous')) {
      user.name = name;
    }
  }

  return user;
}

export function getAllMemoryUsers(): any[] {
  return Array.from(memoryUsers.values());
}
