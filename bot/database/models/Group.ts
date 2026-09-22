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
  adminOnly: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const GroupModel = mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);

const memoryGroups = new Map<string, any>();

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
      return group;
    }
  } catch (err) {
    // Fallback to memory
  }

  if (!memoryGroups.has(jid)) {
    memoryGroups.set(jid, {
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
      save: async function() { return this; }
    });
  }
  const group = memoryGroups.get(jid);
  if (name && group.name === 'WhatsApp Group') group.name = name;
  return group;
}

export function getAllMemoryGroups(): any[] {
  return Array.from(memoryGroups.values());
}
