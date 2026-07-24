import { MongoClient } from 'mongodb';

// Extract connection string from env, or use the provided one.
// We strip the tlsCAFile for local development.
const rawUri = process.env.MONGODB_URI || "mongodb://admin:Think10%40Db123%23@187.127.186.89:47017/?directConnection=true&tls=true";

// For local testing, we bypass strict TLS since the certificate isn't present
let uri = rawUri.replace(/&?tlsCAFile=[^&]+/, '');
if (uri.includes('tls=true') && !uri.includes('tlsAllowInvalidCertificates')) {
  uri += '&tlsAllowInvalidCertificates=true';
}

const client = new MongoClient(uri);

// Type definitions to allow adding _mongoClientPromise to global in development
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    clientPromise = client.connect();
    global._mongoClientPromise = clientPromise;
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = client.connect();
}

/**
 * Returns a connected MongoDB database instance.
 */
export async function getDb() {
  const c = await clientPromise;
  return c.db('think10');
}
