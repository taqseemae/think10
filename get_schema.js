import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI.replace('tls=true', 'tls=false'));
  await client.connect();
  const db = client.db('think10');
  const booking = await db.collection('bookings').findOne({}, { sort: { _id: -1 } });
  console.log(JSON.stringify(booking, null, 2));
  await client.close();
}
main();
