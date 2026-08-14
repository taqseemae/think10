import { getDb } from "./src/lib/mongodb";
async function main() {
  const db = await getDb();
  const booking = await db.collection("bookings").findOne({ nylasBotId: { $exists: true } }, { sort: { _id: -1 } });
  console.log("Recording URL:", booking?.recordingUrl);
  console.log("Type:", typeof booking?.recordingUrl);
  process.exit(0);
}
main();
