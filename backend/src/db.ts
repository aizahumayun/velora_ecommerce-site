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
let connectPromise: Promise<boolean> | null = null;

/**
 * Connect to MongoDB using Mongoose (cached, serverless-safe)
 */
export function connectDB(): Promise<boolean> {
  // Already connected: nothing to do
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(true);
  }

  // Connection attempt already in progress: reuse it
  if (connectPromise) {
    return connectPromise;
  }

  const uri = config.mongodb.uri;

  if (!uri) {
    console.warn(
      '⚠ MONGODB_URI is not defined in environment variables.\n' +
      '  To enable database persistence, set MONGODB_URI in your environment (e.g., MongoDB Atlas URI).'
    );
    return Promise.resolve(false);
  }

  connectPromise = (async () => {
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
          '⚠ MongoDB Atlas IP Whitelist Notice: Atlas Network Access mein 0.0.0.0/0 allow karo (Vercel ke IPs fixed nahi hote).'
        );
      } else {
        console.error('✗ Failed to connect to MongoDB:', error instanceof Error ? error.name : 'Unknown error');
      }
      return false;
    } finally {
      // Fail hua to agli request dobara try kare
      if (mongoose.connection.readyState !== 1) {
        connectPromise = null;
      }
    }
  })();

  return connectPromise;
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
