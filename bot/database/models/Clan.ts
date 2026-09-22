/**
 * Clan & RPG & Session Models
 */

import mongoose, { Schema, Document } from 'mongoose';

// --- CLAN SCHEMA ---
export interface IClan extends Document {
  name: string;
  leader: string;
  members: string[];
  level: number;
  exp: number;
  treasury: number;
  warWins: number;
  description: string;
}

const ClanSchema = new Schema<IClan>({
  name: { type: String, required: true, unique: true },
  leader: { type: String, required: true },
  members: [{ type: String }],
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  treasury: { type: Number, default: 0 },
  warWins: { type: Number, default: 0 },
  description: { type: String, default: 'Klan petualang hebat.' }
}, { timestamps: true });

export const ClanModel = mongoose.models.Clan || mongoose.model<IClan>('Clan', ClanSchema);

// --- RPG SCHEMA ---
export interface IRPG extends Document {
  userId: string;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  attack: number;
  defense: number;
  inventory: {
    sword: number;
    shield: number;
    potion: number;
    wood: number;
    stone: number;
    iron: number;
    diamond: number;
    fish: number;
    crop: number;
  };
  pet: {
    name: string;
    type: string;
    level: number;
    exp: number;
  } | null;
  bank: number;
  marriage: string | null;
  dungeonLevel: number;
}

const RPGSchema = new Schema<IRPG>({
  userId: { type: String, required: true, unique: true },
  health: { type: Number, default: 100 },
  maxHealth: { type: Number, default: 100 },
  stamina: { type: Number, default: 100 },
  maxStamina: { type: Number, default: 100 },
  attack: { type: Number, default: 10 },
  defense: { type: Number, default: 5 },
  inventory: {
    sword: { type: Number, default: 1 },
    shield: { type: Number, default: 1 },
    potion: { type: Number, default: 5 },
    wood: { type: Number, default: 0 },
    stone: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    diamond: { type: Number, default: 0 },
    fish: { type: Number, default: 0 },
    crop: { type: Number, default: 0 }
  },
  pet: {
    name: { type: String, default: '' },
    type: { type: String, default: '' },
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 }
  },
  bank: { type: Number, default: 0 },
  marriage: { type: String, default: null },
  dungeonLevel: { type: Number, default: 1 }
}, { timestamps: true });

export const RPGModel = mongoose.models.RPG || mongoose.model<IRPG>('RPG', RPGSchema);

// Memory RPG store
const memoryRPG = new Map<string, any>();

export async function getRPGData(userId: string): Promise<any> {
  const cleanId = userId.split('@')[0] + '@s.whatsapp.net';
  try {
    if (mongoose.connection.readyState === 1) {
      let rpg = await RPGModel.findOne({ userId: cleanId });
      if (!rpg) {
        rpg = await RPGModel.create({ userId: cleanId });
      }
      return rpg;
    }
  } catch (err) {}

  if (!memoryRPG.has(cleanId)) {
    memoryRPG.set(cleanId, {
      userId: cleanId,
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      attack: 15,
      defense: 8,
      inventory: {
        sword: 1,
        shield: 1,
        potion: 5,
        wood: 12,
        stone: 8,
        iron: 3,
        diamond: 0,
        fish: 4,
        crop: 6
      },
      pet: { name: 'Kucing Oren', type: 'Cat', level: 1, exp: 20 },
      bank: 5000,
      marriage: null,
      dungeonLevel: 1,
      save: async function() { return this; }
    });
  }
  return memoryRPG.get(cleanId);
}
