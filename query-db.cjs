const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGO_DB);
  await client.connect();
  const db = client.db();
  const bookings = await db.collection('bookings').find().sort({ createdAt: -1 }).limit(3).toArray();
  bookings.forEach(b => {
    console.log(`Booking: ${b.topic}`);
    console.log(`Meet Link: ${b.meetLink}`);
    console.log(`Bot ID: ${b.recallBotId}`);
    console.log(`Bot Error: ${b.botError}`);
    console.log('---');
  });
  await client.close();
}
run();
