import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "@/lib/mongodb";
import { createHmac, timingSafeEqual } from "crypto";

// Verify that the webhook request is genuinely from Recall.ai
function verifyRecallSignature(body: string, signatureHeader: string | null): boolean {
  const secret = process.env.RECALL_WEBHOOK_SECRET;
  if (!secret) {
    // If no secret configured, skip verification (not recommended for production)
    console.warn("[Recall Webhook] RECALL_WEBHOOK_SECRET not set — skipping signature check");
    return true;
  }
  if (!signatureHeader) {
    console.warn("[Recall Webhook] No signature header received");
    return false;
  }
  try {
    const hmac = createHmac("sha256", secret);
    hmac.update(body);
    const expectedSig = "sha256=" + hmac.digest("hex");
    const sigBuffer = Buffer.from(signatureHeader);
    const expectedBuffer = Buffer.from(expectedSig);
    if (sigBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
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
          const signatureHeader = request.headers.get("x-recall-signature");

          // Verify signature
          if (!verifyRecallSignature(rawBody, signatureHeader)) {
            console.error("[Recall Webhook] ❌ Invalid signature — request rejected");
            return new Response("Unauthorized", { status: 401 });
          }

          const event = JSON.parse(rawBody);
          console.log("[Recall Webhook] ✅ Verified event:", event.event);

          const db = await getDb();
          const { ObjectId } = await import("mongodb");

          const botId = event.data?.bot_id;
          if (!botId) {
            return new Response("No bot_id in payload", { status: 400 });
          }

          // Find the booking associated with this bot
          const booking = await db
            .collection("bookings")
            .findOne({ recallBotId: botId });

          if (!booking) {
            console.warn(`[Recall Webhook] No booking found for bot ${botId}`);
            return new Response("OK", { status: 200 });
          }

          const updateData: Record<string, any> = {};
          const RECALL_API_KEY = process.env.RECALL_API_KEY;
          const RECALL_BASE = "https://us-west-2.recall.ai/api/v1";

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
