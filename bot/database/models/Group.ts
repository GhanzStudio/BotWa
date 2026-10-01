/**
 * Group Model Schema
 * Handles group settings, welcome/goodbye messages, anti-link, sewa bot expiration, and permissions.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  id: string; // Group JID (e.g. 120363xxx@g.us)
  name: string;
  welcome: boolean;
  welcomeMessage: string;
  goodbye: boolean;
  goodbyeMessage: string;
  rules: string;
  antiLink: boolean;
  antiLinkAll: boolean;
  antiToxic: boolean;
  antiSpam: boolean;
  antiBot: boolean;
  antiMedia: boolean;
  antiSticker: boolean;
  antiDocument: boolean;
  autoSticker: boolean;
  mute: boolean;
  sewaExpired: Date | null;
  isBanned: boolean;
  bannedReason: string | null;
  adminOnly: boolean;
  nsfwEnabled: boolean;
  ageConsentAccepted: boolean;
  ageConsentAcceptedBy: string | null;
  ageConsentAcceptedAt: Date | null;
  ownerApproved18: boolean;
  ownerApprovedAt: Date | null;
  ownerApprovedBy: string | null;
}

const GroupSchema = new Schema<IGroup>({
  id: { type: String, required: true, unique: true },
  name: { type: String, default: 'WhatsApp Group' },
  welcome: { type: Boolean, default: true },
  welcomeMessage: { type: String, default: 'Halo @user, selamat datang di @group!\nJangan lupa baca deskripsi & patuhi rules ya.' },
  goodbye: { type: Boolean, default: true },
  goodbyeMessage: { type: String, default: 'Selamat jalan @user, semoga hari-harimu menyenangkan.' },
  rules: { type: String, default: '1. Saling menghormati sesama member\n2. Dilarang spam\n3. Dilarang share link tanpa izin' },
  antiLink: { type: Boolean, default: false },
  antiLinkAll: { type: Boolean, default: false },
  antiToxic: { type: Boolean, default: false },
  antiSpam: { type: Boolean, default: true },
  antiBot: { type: Boolean, default: false },
  antiMedia: { type: Boolean, default: false },
  antiSticker: { type: Boolean, default: false },
  antiDocument: { type: Boolean, default: false },
  autoSticker: { type: Boolean, default: false },
  mute: { type: Boolean, default: false },
  sewaExpired: { type: Date, default: null },
  isBanned: { type: Boolean, default: false },
  bannedReason: { type: String, default: null },
  adminOnly: { type: Boolean, default: false },
  nsfwEnabled: { type: Boolean, default: false },
  ageConsentAccepted: { type: Boolean, default: false },
  ageConsentAcceptedBy: { type: String, default: null },
  ageConsentAcceptedAt: { type: Date, default: null },
  ownerApproved18: { type: Boolean, default: false },
  ownerApprovedBy: { type: String, default: null },
  ownerApprovedAt: { type: Date, default: null }
}, {
  timestamps: true
});

export const GroupModel = mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const GROUPS_FILE = path.join(DATA_DIR, 'groups.json');
const APPROVED18_FILE = path.join(DATA_DIR, 'approved18_groups.json');
const PENDING18_FILE = path.join(DATA_DIR, 'pending18_requests.json');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (_) {}
}

const memoryGroups = new Map<string, any>();
const approved18GroupJids = new Set<string>();
const pending18RequestsMap = new Map<string, any>();

function saveGroupDataToDisk() {
  try {
    // 1. Save list of all memory groups
    const list = Array.from(memoryGroups.values()).map(g => {
      const clone = { ...g };
      delete clone.save;
      return clone;
    });
    fs.writeFileSync(GROUPS_FILE, JSON.stringify(list, null, 2));

    // 2. Save approved 18+ groups list
    const approvedJids = Array.from(approved18GroupJids);
    for (const g of memoryGroups.values()) {
      if (g.ownerApproved18 && !approvedJids.includes(g.id)) {
        approvedJids.push(g.id);
      }
    }
    fs.writeFileSync(APPROVED18_FILE, JSON.stringify(approvedJids, null, 2));

    // 3. Save pending 18+ requests
    const pendingList = Array.from(pending18RequestsMap.values());
    fs.writeFileSync(PENDING18_FILE, JSON.stringify(pendingList, null, 2));
  } catch (err: any) {
    console.warn('[GroupDB] Gagal menyimpan data grup ke disk:', err.message);
  }
}

function loadPersistedGroups() {
  // Load approved 18+ JIDs first
  try {
    if (fs.existsSync(APPROVED18_FILE)) {
      const data = JSON.parse(fs.readFileSync(APPROVED18_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        for (const jid of data) {
          if (typeof jid === 'string' && jid) {
            approved18GroupJids.add(jid);
          }
        }
      }
    }
  } catch (err: any) {
    console.warn('[GroupDB] Gagal membaca file approved18_groups.json:', err.message);
  }

  // Load pending 18+ requests
  try {
    if (fs.existsSync(PENDING18_FILE)) {
      const pendingData = JSON.parse(fs.readFileSync(PENDING18_FILE, 'utf-8'));
      if (Array.isArray(pendingData)) {
        for (const req of pendingData) {
          if (req.id && !approved18GroupJids.has(req.id)) {
            pending18RequestsMap.set(req.id, req);
          }
        }
      }
    }
  } catch (err: any) {
    console.warn('[GroupDB] Gagal membaca file pending18_requests.json:', err.message);
  }

  // Load groups from file
  try {
    if (fs.existsSync(GROUPS_FILE)) {
      const savedGroups = JSON.parse(fs.readFileSync(GROUPS_FILE, 'utf-8'));
      if (Array.isArray(savedGroups)) {
        for (const g of savedGroups) {
          if (g.id) {
            if (approved18GroupJids.has(g.id)) {
              g.ownerApproved18 = true;
              g.nsfwEnabled = true;
              g.ageConsentAccepted = true;
            }
            g.save = async function() {
              if (this.ownerApproved18) {
                approved18GroupJids.add(this.id);
                pending18RequestsMap.delete(this.id);
              } else {
                approved18GroupJids.delete(this.id);
              }
              saveGroupDataToDisk();
              return this;
            };
            memoryGroups.set(g.id, g);
          }
        }
      }
    }
  } catch (err: any) {
    console.warn('[GroupDB] Gagal membaca file groups.json:', err.message);
  }
}

// Initial load
loadPersistedGroups();

export async function getGroup(jid: string, name?: string): Promise<any> {
  try {
    if (mongoose.connection.readyState === 1) {
      let group = await GroupModel.findOne({ id: jid });
      if (!group) {
        group = await GroupModel.create({
          id: jid,
          name: name || 'WhatsApp Group'
        });
      }

      // Check if jid is in persistent 18+ approved set
      if (approved18GroupJids.has(jid) && !group.ownerApproved18) {
        group.ownerApproved18 = true;
        group.nsfwEnabled = true;
        group.ageConsentAccepted = true;
        await group.save();
      }

      return group;
    }
  } catch (err) {
    // Fallback to memory
  }

  if (!memoryGroups.has(jid)) {
    const is18Approved = approved18GroupJids.has(jid);
    const newGroupObj = {
      id: jid,
      name: name || 'WhatsApp Group',
      welcome: true,
      welcomeMessage: 'Halo @user, selamat datang di @group!\nJangan lupa patuhi rules ya.',
      goodbye: true,
      goodbyeMessage: 'Selamat tinggal @user!',
      rules: '1. Saling menghormati\n2. Dilarang spam\n3. Patuhi aturan admin',
      antiLink: false,
      antiLinkAll: false,
      antiToxic: false,
      antiSpam: true,
      antiBot: false,
      antiMedia: false,
      antiSticker: false,
      antiDocument: false,
      autoSticker: false,
      mute: false,
      sewaExpired: null,
      isBanned: false,
      bannedReason: null,
      adminOnly: false,
      nsfwEnabled: is18Approved,
      ageConsentAccepted: is18Approved,
      ageConsentAcceptedBy: null,
      ageConsentAcceptedAt: null,
      ownerApproved18: is18Approved,
      ownerApprovedBy: null,
      ownerApprovedAt: null,
      save: async function() {
        if (this.ownerApproved18) {
          approved18GroupJids.add(this.id);
        } else {
          approved18GroupJids.delete(this.id);
        }
        saveGroupDataToDisk();
        return this;
      }
    };

    memoryGroups.set(jid, newGroupObj);
    saveGroupDataToDisk();
  }

  const group = memoryGroups.get(jid);
  if (name && group.name === 'WhatsApp Group') {
    group.name = name;
    saveGroupDataToDisk();
  }

  if (approved18GroupJids.has(jid) && !group.ownerApproved18) {
    group.ownerApproved18 = true;
    group.nsfwEnabled = true;
    group.ageConsentAccepted = true;
    saveGroupDataToDisk();
  }

  return group;
}

export function getAllMemoryGroups(): any[] {
  return Array.from(memoryGroups.values());
}

export function isGroup18Approved(jid: string): boolean {
  if (!jid) return false;
  const cleanJid = jid.includes('@') ? jid.trim() : `${jid.trim()}@g.us`;
  const rawId = jid.split('@')[0].trim();
  return approved18GroupJids.has(cleanJid) || approved18GroupJids.has(rawId) || approved18GroupJids.has(jid);
}

export function getApproved18GroupsList(): string[] {
  return Array.from(approved18GroupJids);
}

export async function requestGroup18(
  jid: string,
  name?: string,
  requestedBy?: string,
  reason?: string
): Promise<any> {
  const cleanJid = jid.includes('@') ? jid.trim() : `${jid.trim()}@g.us`;
  const group = await getGroup(cleanJid, name);

  group.ageConsentAccepted = true;
  group.ageConsentAcceptedBy = requestedBy || 'Admin';
  group.ageConsentAcceptedAt = new Date();

  const reqObj = {
    id: cleanJid,
    name: group.name || name || 'WhatsApp Group',
    requestedBy: requestedBy || 'Admin',
    requestedAt: new Date(),
    reason: reason || 'Permohonan Akses 18+'
  };

  pending18RequestsMap.set(cleanJid, reqObj);
  if (group.save) {
    try { await group.save(); } catch (_) {}
  }
  saveGroupDataToDisk();
  return reqObj;
}

export function getPending18RequestsList(): any[] {
  return Array.from(pending18RequestsMap.values()).filter(r => !approved18GroupJids.has(r.id));
}

export async function approveGroup18(jid: string, approvedBy: string = 'Owner'): Promise<any> {
  const cleanJid = jid.includes('@') ? jid.trim() : `${jid.trim()}@g.us`;
  const rawId = jid.split('@')[0].trim();

  approved18GroupJids.add(cleanJid);
  approved18GroupJids.add(rawId);
  pending18RequestsMap.delete(cleanJid);
  pending18RequestsMap.delete(rawId);

  const group = await getGroup(cleanJid);
  group.ownerApproved18 = true;
  group.ownerApprovedBy = approvedBy;
  group.ownerApprovedAt = new Date();
  group.nsfwEnabled = true;
  group.ageConsentAccepted = true;
  if (group.save) {
    try { await group.save(); } catch (_) {}
  }
  saveGroupDataToDisk();
  return group;
}

export async function revokeGroup18(jid: string): Promise<any> {
  const cleanJid = jid.includes('@') ? jid.trim() : `${jid.trim()}@g.us`;
  const rawId = jid.split('@')[0].trim();

  approved18GroupJids.delete(cleanJid);
  approved18GroupJids.delete(rawId);
  pending18RequestsMap.delete(cleanJid);
  pending18RequestsMap.delete(rawId);

  const group = await getGroup(cleanJid);
  group.ownerApproved18 = false;
  group.nsfwEnabled = false;
  group.ageConsentAccepted = false;
  if (group.save) {
    try { await group.save(); } catch (_) {}
  }
  saveGroupDataToDisk();
  return group;
}
