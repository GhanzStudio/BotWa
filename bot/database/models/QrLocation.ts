/**
 * QR Location Real-Time Tracker Model
 * Stores generated QR messages and scan location logs in MongoDB with in-memory fallback.
 */

import mongoose from 'mongoose';

export interface ScanRecord {
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  googleMapsUrl?: string;
}

export interface IQrLocation {
  qrId: string;
  creatorJid: string;
  creatorName: string;
  message: string;
  createdAt: Date;
  scans: ScanRecord[];
}

const ScanSchema = new mongoose.Schema<ScanRecord>({
  timestamp: { type: Date, default: Date.now },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  googleMapsUrl: { type: String, default: '' }
});

const QrLocationSchema = new mongoose.Schema<IQrLocation>({
  qrId: { type: String, required: true, unique: true },
  creatorJid: { type: String, required: true },
  creatorName: { type: String, default: 'User' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  scans: [ScanSchema]
});

export const QrLocationModel = mongoose.models.QrLocation || mongoose.model<IQrLocation>('QrLocation', QrLocationSchema);

// In-Memory Fallback Store
const memoryStore = new Map<string, IQrLocation>();

export async function createQrLocationRecord(
  qrId: string,
  creatorJid: string,
  creatorName: string,
  message: string
): Promise<IQrLocation> {
  const recordData: IQrLocation = {
    qrId,
    creatorJid,
    creatorName,
    message,
    createdAt: new Date(),
    scans: []
  };

  memoryStore.set(qrId, recordData);

  try {
    if (mongoose.connection.readyState === 1) {
      const doc = new QrLocationModel(recordData);
      await doc.save();
    }
  } catch (err: any) {
    console.warn('[QrLocation] Mongo save warning:', err.message);
  }

  return recordData;
}

export async function getQrLocationRecord(qrId: string): Promise<IQrLocation | null> {
  let doc = memoryStore.get(qrId) || null;

  try {
    if (!doc && mongoose.connection.readyState === 1) {
      const mongoDoc = await QrLocationModel.findOne({ qrId });
      if (mongoDoc) {
        doc = mongoDoc.toObject() as IQrLocation;
        memoryStore.set(qrId, doc);
      }
    }
  } catch (err: any) {
    console.warn('[QrLocation] Mongo fetch warning:', err.message);
  }

  return doc;
}

export async function addScanLogToQrLocation(
  qrId: string,
  scanData: ScanRecord
): Promise<IQrLocation | null> {
  const doc = await getQrLocationRecord(qrId);
  if (!doc) return null;

  doc.scans.unshift(scanData);
  memoryStore.set(qrId, doc);

  try {
    if (mongoose.connection.readyState === 1) {
      await QrLocationModel.updateOne(
        { qrId },
        { $push: { scans: { $each: [scanData], $position: 0 } } }
      );
    }
  } catch (err: any) {
    console.warn('[QrLocation] Mongo push scan warning:', err.message);
  }

  return doc;
}

export async function getQrLocationsByCreator(creatorJid: string): Promise<IQrLocation[]> {
  const memoryList = Array.from(memoryStore.values()).filter(q => q.creatorJid === creatorJid);

  try {
    if (mongoose.connection.readyState === 1) {
      const mongoDocs = await QrLocationModel.find({ creatorJid }).sort({ createdAt: -1 });
      if (mongoDocs && mongoDocs.length > 0) {
        return mongoDocs.map(d => d.toObject());
      }
    }
  } catch (err: any) {
    console.warn('[QrLocation] Mongo fetch by creator warning:', err.message);
  }

  return memoryList;
}
