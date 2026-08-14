import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI.replace('tls=true', 'tls=false'));
  await client.connect();
  const db = client.db('think10');
  
  // Get latest booking
  const booking = await db.collection('bookings').findOne({ nylasBotId: { $exists: true } }, { sort: { _id: -1 } });
  
  const response = await fetch(`https://api.us.nylas.com/v3/grants/${process.env.NYLAS_GRANT_ID}/notetakers/${booking.nylasBotId}/media`, {
    headers: { "Authorization": `Bearer ${process.env.NYLAS_API_KEY}` }
  });
  const data = await response.json();
  console.log("Nylas Data:", JSON.stringify(data, null, 2));
  
  let targetUrl;
  if (Array.isArray(data.data)) {
     const mediaItem = data.data.find(item => item.type === "transcript" || item.media_type === "transcript");
     if (mediaItem) targetUrl = mediaItem.url || mediaItem.download_url || mediaItem.link;
  } else {
     targetUrl = data.data?.transcript;
     if (targetUrl && typeof targetUrl === 'object') targetUrl = targetUrl.url || targetUrl.download_url || targetUrl.link;
  }
  
  if (targetUrl) {
    console.log("Target URL:", targetUrl);
    const transcriptRes = await fetch(targetUrl);
    const transcriptData = await transcriptRes.text();
    console.log("Transcript Data length:", transcriptData.length);
    console.log("Transcript Data sample:", transcriptData.slice(0, 500));
  }
  
  await client.close();
}
main();
