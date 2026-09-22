/**
 * User Model Schema
 * Handles user profile, level, exp, balance (koin), limit/energi, roles, and ban status.
 */

import mongoose, { Schema, Document } from 'mongoose';

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
  totalHit: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// In-memory fallback map for offline operations
const memoryUsers = new Map<string, any>();

export async function getUser(jid: string, name?: string): Promise<any> {
  const cleanJid = jid.split('@')[0] + '@s.whatsapp.net';
  try {
    if (mongoose.connection.readyState === 1) {
      let user = await UserModel.findOne({ id: cleanJid });
      if (!user) {
        user = await UserModel.create({
          id: cleanJid,
          name: name || 'User',
          limit: 50,
          koin: 1000,
          exp: 0,
          level: 1
        });
      }
      return user;
    }
  } catch (err) {
    // Fallback to memory
  }

  if (!memoryUsers.has(cleanJid)) {
    memoryUsers.set(cleanJid, {
      id: cleanJid,
      name: name || 'User',
      exp: 0,
      level: 1,
      koin: 1000,
      limit: 50,
      lastDaily: null,
      lastWeekly: null,
      role: 'user',
      premium: false,
      premiumExpired: null,
      registered: false,
      registeredAt: null,
      age: 0,
      birthday: null,
      banned: false,
      banReason: null,
      warn: 0,
      totalHit: 0,
      save: async function() { return this; }
    });
  }
  const user = memoryUsers.get(cleanJid);
  if (name && user.name === 'User') user.name = name;
  return user;
}

export function getAllMemoryUsers(): any[] {
  return Array.from(memoryUsers.values());
}
