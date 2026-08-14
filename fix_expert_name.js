import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI.replace('tls=true', 'tls=false'));
  await client.connect();
  const db = client.db('think10');
  
  const bookings = await db.collection('bookings').find({ consultantName: { $exists: true }, expertName: { $exists: false } }).toArray();
  for (const b of bookings) {
     await db.collection('bookings').updateOne({ _id: b._id }, { $set: { expertName: b.consultantName } });
  }
  console.log("Fixed", bookings.length, "bookings.");
  
  await client.close();
}
main();
