import { MongoClient } from 'mongodb';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const uri = process.env.MONGODB_URI;
  console.log("URI:", uri ? uri.substring(0,20) + "..." : "missing");
  
  // We need to bypass the cert check for local script if it fails
  const client = new MongoClient(uri, { tls: false });
  try {
     await client.connect();
     const db = client.db('think10');
     const booking = await db.collection('bookings').findOne({ nylasBotId: { $exists: true } }, { sort: { _id: -1 } });
     console.log("Recording URL:", booking?.recordingUrl);
     console.log("Type:", typeof booking?.recordingUrl);
  } catch (e) {
     console.error(e);
  } finally {
     await client.close();
  }
}
main();
