/**
 * MongoDB Connection & In-Memory Fallback Manager
 * Provides reliable data persistence with automatic offline fallback.
 */

import mongoose from 'mongoose';
import { config } from '../config.ts';

let isConnected = false;
let connectionError: string | null = null;

export async function connectDB(): Promise<boolean> {
  if (isConnected) return true;
  if (!config.mongodbUri || config.mongodbUri.includes('localhost:27017')) {
    // Attempt local connection with short timeout
    try {
      await mongoose.connect(config.mongodbUri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000
      });
      isConnected = true;
      connectionError = null;
      console.log('✅ Connected to MongoDB successfully.');
      return true;
    } catch (err: any) {
      connectionError = err.message;
      console.warn('⚠️ MongoDB not reachable at', config.mongodbUri, '- using in-memory hybrid store:', err.message);
      return false;
    }
  }

  try {
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    connectionError = null;
    console.log('✅ Connected to MongoDB cluster successfully.');
    return true;
  } catch (err: any) {
    connectionError = err.message;
    console.error('❌ MongoDB connection error:', err.message);
    return false;
  }
}

export function isMongoConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export function getMongoStatus(): { connected: boolean; status: string; uri: string; error: string | null } {
  const readyStates = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const state = mongoose.connection.readyState;
  return {
    connected: state === 1,
    status: readyStates[state] || 'Unknown',
    uri: config.mongodbUri ? config.mongodbUri.replace(/:([^:@]+)@/, ':****@') : 'Not Configured',
    error: connectionError
  };
}
