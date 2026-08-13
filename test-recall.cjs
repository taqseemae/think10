require('dotenv').config();
const fetch = require('node-fetch');

async function run() {
  const payload = {
    meeting_url: "https://meet.google.com/abc-defg-hij",
    bot_name: "Think10 AI Notetaker",
    google_meet: { 
      google_login_group_id: process.env.RECALL_LOGIN_GROUP_ID || 'fake',
      automatic_admit: true
    },
    metadata: { bookingId: "fake" }
  };
  console.log("Sending payload:", payload);
  const response = await fetch("https://us-west-2.recall.ai/api/v1/bot", {
    method: "POST",
    headers: {
      "Authorization": `Token ${process.env.RECALL_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  console.log("Status:", response.status);
  console.log("Response:", await response.text());
}
run();
