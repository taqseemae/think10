import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "@/lib/mongodb";
import { Webhook } from "svix";

// Verify that the webhook request is genuinely from Recall.ai
function verifyRecallSignature(body: string, headers: Headers): boolean {
  const secret = process.env.RECALL_WEBHOOK_SECRET;
  if (!secret) {
    // If no secret configured, skip verification (not recommended for production)
    console.warn("[Recall Webhook] RECALL_WEBHOOK_SECRET not set — skipping signature check");
    return true;
  }
  
  try {
    const wh = new Webhook(secret);
    // Convert Headers object to a plain record for Svix
    const headerPayload: Record<string, string> = {};
    headers.forEach((value, key) => {
      headerPayload[key] = value;
    });
    
    // Svix verify throws an error if signature is invalid
    wh.verify(body, headerPayload);
    return true;
  } catch (err: any) {
    console.error("[Recall Webhook] Signature verification failed:", err.message);
    return false;
  }
}

export const Route = createFileRoute("/api/recall-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Read raw body text for signature verification
          const rawBody = await request.text();
          // Verify signature using Svix
          if (!verifyRecallSignature(rawBody, request.headers)) {
            console.error("[Recall Webhook] ❌ Invalid signature — request rejected");
            return new Response("Unauthorized", { status: 401 });
          }

          const event = JSON.parse(rawBody);
          console.log("[Recall Webhook] ✅ Verified event:", event.event);

          const db = await getDb();
          const { ObjectId } = await import("mongodb");

          const botId = event.data?.bot_id || event.data?.bot?.id;
          if (!botId) {
            console.error("[Recall Webhook] ❌ No bot_id found in payload:", JSON.stringify(event));
            return new Response("No bot_id in payload", { status: 400 });
          }

          // 1. Try finding by recallBotId (if triggered by button)
          let booking = await db.collection("bookings").findOne({ recallBotId: botId });

          // 2. If not found, it might be an AUTO-RECORDED bot from calendar.
          // Try to find the booking by matching the meeting URL or ID.
          const RECALL_API_KEY = process.env.RECALL_API_KEY;
          const RECALL_BASE = "https://us-west-2.recall.ai/api/v1";

          if (!booking && RECALL_API_KEY) {
            console.log(`[Recall Webhook] Bot ${botId} not found by ID, checking if it's an auto-record bot...`);
            try {
              const botRes = await fetch(`${RECALL_BASE}/bot/${botId}`, {
                headers: { Authorization: `Token ${RECALL_API_KEY}` },
              });
              if (botRes.ok) {
                const botData = await botRes.json();
                const meetId = botData.meeting_url?.meeting_id; // e.g., "abc-defg-hij"
                if (meetId) {
                  // Find booking whose meetLink contains this meetId
                  booking = await db.collection("bookings").findOne({
                    meetLink: { $regex: meetId, $options: "i" }
                  });
                  
                  if (booking) {
                    console.log(`[Recall Webhook] 🔗 Auto-linked bot ${botId} to booking ${booking._id}`);
                    // Save the botId to this booking so future webhooks find it quickly
                    await db.collection("bookings").updateOne(
                      { _id: new ObjectId(booking._id) },
                      { $set: { recallBotId: botId } }
                    );
                  }
                }
              }
            } catch (e) {
              console.error("[Recall Webhook] Error resolving auto-record bot:", e);
            }
          }

          if (!booking) {
            console.warn(`[Recall Webhook] No booking found for bot ${botId} even after checking meeting URL`);
            return new Response("OK", { status: 200 });
          }

          const updateData: Record<string, any> = {};

          // Helper to fetch transcript
          const fetchTranscript = async () => {
            if (!RECALL_API_KEY) return;
            const transcriptRes = await fetch(`${RECALL_BASE}/bot/${botId}/transcript`, {
              headers: { Authorization: `Token ${RECALL_API_KEY}` },
            });
            if (transcriptRes.ok) {
              const tData = await transcriptRes.json();
              let transcriptText = "";
              if (Array.isArray(tData)) {
                transcriptText = tData
                  .map((u: any) => `${u.speaker || "Speaker"}: ${u.text || ""}`)
                  .join("\n");
              } else if (tData?.text) {
                transcriptText = tData.text;
              }
              if (transcriptText) updateData.transcript = transcriptText;
            }
          };

          if (event.event === "bot.status_change") {
            const status = event.data?.status?.code;
            console.log(`[Recall Webhook] Bot status: ${status}`);

            if ((status === "done" || status === "call_ended") && RECALL_API_KEY) {
              // Fetch bot details for video URL
              const botRes = await fetch(`${RECALL_BASE}/bot/${botId}`, {
                headers: { Authorization: `Token ${RECALL_API_KEY}` },
              });
              if (botRes.ok) {
                const botData = await botRes.json();
                if (botData.video_url) {
                  updateData.recordingUrl = botData.video_url;
                  updateData.status = "COMPLETED";
                }
              }
              await fetchTranscript();
            }
          }

          if (event.event === "bot.video_ready") {
            updateData.recordingUrl = event.data?.video_url;
            updateData.status = "COMPLETED";
          }

          if (event.event === "bot.transcript_ready") {
            await fetchTranscript();
          }

          if (Object.keys(updateData).length > 0) {
            await db.collection("bookings").updateOne(
              { _id: new ObjectId(booking._id) },
              { $set: updateData }
            );
            console.log(
              `[Recall Webhook] ✅ Updated booking ${booking._id}`,
              Object.keys(updateData)
            );
          }

          return new Response("OK", { status: 200 });
        } catch (err) {
          console.error("[Recall Webhook Error]", err);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
