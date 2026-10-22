import mongoose from 'mongoose';
import { config } from './config.js';

export interface DatabaseStatus {
  isConnected: boolean;
  state: 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'unconfigured';
  host?: string;
  name?: string;
  lastError?: string;
}

let lastConnectionError: string | null = null;

// Track connection state events
mongoose.connection.on('connected', () => {
  lastConnectionError = null;
  console.log('✓ MongoDB connected successfully to database:', mongoose.connection.name);
});

mongoose.connection.on('error', (err) => {
  lastConnectionError = err?.message || String(err);
  console.error('✗ MongoDB connection error:', lastConnectionError);
});

mongoose.connection.on('disconnected', () => {
  console.warn('! MongoDB connection lost / disconnected');
});

/**
 * Connect to MongoDB using Mongoose
 */
export async function connectDB(): Promise<boolean> {
  const uri = config.mongodb.uri;

  if (!uri) {
    console.warn(
      '⚠ MONGODB_URI is not defined in environment variables.\n' +
      '  To enable database persistence, set MONGODB_URI in your environment (e.g., MongoDB Atlas URI).'
    );
    return false;
  }

  try {
    lastConnectionError = null;
    await mongoose.connect(uri, {
      dbName: config.mongodb.dbName,
      serverSelectionTimeoutMS: 5000,
    });
    return true;
  } catch (error) {
    const errStr = error instanceof Error ? error.message : String(error);
    lastConnectionError = errStr;
    const isIpWhitelistError = 
      errStr.includes('whitelisted') || 
      errStr.includes('SSL alert number 80') ||
      errStr.includes('tlsv1 alert internal error');

    if (isIpWhitelistError) {
      console.warn(
        '\n============================================================\n' +
        '⚠ MongoDB Atlas IP Whitelist Notice:\n' +
        '  The connection to MongoDB Atlas was rejected during TLS handshake.\n' +
        '  MongoDB Atlas closes connections with SSL alert 80 when the caller IP\n' +
        '  is not included in Atlas Network Access IP Access List.\n' +
        '  To resolve this:\n' +
        '  1. Go to MongoDB Atlas (cloud.mongodb.com) -> Network Access.\n' +
        '  2. Click "Add IP Address" -> choose "Allow Access from Anywhere" (0.0.0.0/0)\n' +
        '     or add the Cloud Run runtime egress IP.\n' +
        '============================================================\n'
      );
    } else {
      console.error('✗ Failed to connect to MongoDB:', error instanceof Error ? error.name : 'Unknown error');
    }
    return false;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('MongoDB disconnected gracefully.');
  }
}

/**
 * Returns the current database connection status
 */
export function getDBStatus(): DatabaseStatus {
  const readyStates: Record<number, DatabaseStatus['state']> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  if (!config.mongodb.uri) {
    return {
      isConnected: false,
      state: 'unconfigured',
      lastError: 'MONGODB_URI is not set in environment variables',
    };
  }

  const state = readyStates[mongoose.connection.readyState] || 'disconnected';
  const isConnected = mongoose.connection.readyState === 1;

  return {
    isConnected,
    state,
    host: isConnected ? mongoose.connection.host : undefined,
    name: isConnected ? mongoose.connection.name : undefined,
    lastError: lastConnectionError ? 'MongoDB connection failed' : undefined,
  };
}
