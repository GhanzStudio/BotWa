import mongoose, { Schema, Document } from 'mongoose';
import fs from 'fs';
import path from 'path';

export interface IQrisSettings extends Document {
  key: string;
  imageBase64: string;
  mimeType: string;
  updatedBy: string;
  updatedAt: Date;
}

const QrisSettingsSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true, default: 'default_qris' },
  imageBase64: { type: String, required: true },
  mimeType: { type: String, default: 'image/jpeg' },
  updatedBy: { type: String, default: 'System / Web Gallery' },
  updatedAt: { type: Date, default: Date.now }
});

export const QrisModel = mongoose.models.QrisSettings || mongoose.model<IQrisSettings>('QrisSettings', QrisSettingsSchema);

// Memory & Disk Backup Store
const backupFile = path.resolve(process.cwd(), 'bot/database/qris_backup.json');

export async function saveQrisImageToDB(base64Data: string, mimeType = 'image/jpeg', updatedBy = 'Gallery Upload'): Promise<boolean> {
  try {
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    
    // Save to Mongo if connected
    if (mongoose.connection.readyState === 1) {
      await QrisModel.findOneAndUpdate(
        { key: 'default_qris' },
        {
          key: 'default_qris',
          imageBase64: cleanBase64,
          mimeType,
          updatedBy,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
    }

    // Save to disk backup
    fs.mkdirSync(path.dirname(backupFile), { recursive: true });
    fs.writeFileSync(backupFile, JSON.stringify({
      imageBase64: cleanBase64,
      mimeType,
      updatedBy,
      updatedAt: new Date().toISOString()
    }, null, 2));

    // Also write to standard image paths
    const buffer = Buffer.from(cleanBase64, 'base64');
    const targetPaths = [
      path.resolve(process.cwd(), 'public/qris.jpg'),
      path.resolve(process.cwd(), 'public/qris.png'),
      path.resolve(process.cwd(), 'bot/assets/qris.jpg'),
      path.resolve(process.cwd(), 'docs/qris.jpg'),
      path.resolve(process.cwd(), 'src/assets/images/qris.jpg')
    ];

    for (const p of targetPaths) {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, buffer);
    }

    return true;
  } catch (err: any) {
    console.error('[QrisSettings] Gagal menyimpan ke Database:', err.message);
    return false;
  }
}

export async function getQrisImageFromDB(): Promise<{ buffer: Buffer; mimeType: string } | null> {
  try {
    // Check Mongo first
    if (mongoose.connection.readyState === 1) {
      const doc = await QrisModel.findOne({ key: 'default_qris' });
      if (doc && doc.imageBase64) {
        return {
          buffer: Buffer.from(doc.imageBase64, 'base64'),
          mimeType: doc.mimeType || 'image/jpeg'
        };
      }
    }

    // Fallback to disk backup
    if (fs.existsSync(backupFile)) {
      const json = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
      if (json && json.imageBase64) {
        return {
          buffer: Buffer.from(json.imageBase64, 'base64'),
          mimeType: json.mimeType || 'image/jpeg'
        };
      }
    }

    // Fallback to standard asset path
    const assetPath = path.resolve(process.cwd(), 'bot/assets/qris.jpg');
    if (fs.existsSync(assetPath)) {
      return {
        buffer: fs.readFileSync(assetPath),
        mimeType: 'image/jpeg'
      };
    }

    return null;
  } catch (err: any) {
    console.error('[QrisSettings] Gagal membaca dari Database:', err.message);
    return null;
  }
}
