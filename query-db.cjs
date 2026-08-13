const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('No MONGODB_URI in .env');

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('think10'); // Assuming database name or default
    const latestBooking = await db.collection('bookings').find({ topic: "Instant Test Meeting" }).sort({ _id: -1 }).limit(1).toArray();
    console.log(JSON.stringify(latestBooking, null, 2));
  } finally {
    await client.close();
  }
}

run().catch(console.error);
