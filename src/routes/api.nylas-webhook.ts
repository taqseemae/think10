import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "@/lib/mongodb";
import * as crypto from "crypto";

// Verify that the webhook request is genuinely from Nylas
function verifyNylasSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.NYLAS_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[Nylas Webhook] NYLAS_WEBHOOK_SECRET not set — skipping signature check");
    return true; // If no secret is configured, bypass for local dev
  }
  if (!signature) {
    return false;
  }
  
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (err: any) {
    console.error("[Nylas Webhook] Signature verification failed:", err.message);
    return false;
  }
}

export const Route = createFileRoute("/api/nylas-webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const challenge = url.searchParams.get("challenge");
        if (challenge) {
          console.log("[Nylas Webhook] Responding to challenge:", challenge);
          return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
        }
        return new Response("OK", { status: 200 });
      },
      POST: async ({ request }) => {
        try {
          const rawBody = await request.text();
          const signature = request.headers.get("x-nylas-signature");

          if (!verifyNylasSignature(rawBody, signature)) {
            console.error("[Nylas Webhook] ❌ Invalid signature — request rejected");
            return new Response("Invalid signature", { status: 401 });
          }

          const event = JSON.parse(rawBody);
          console.log("[Nylas Webhook] ✅ Received event type:", event.type);

          const botData = event.data?.object;
          if (!botData || !botData.id) {
            console.error("[Nylas Webhook] ❌ No bot_id found in payload");
            return new Response("OK", { status: 200 });
          }

          const botId = botData.id;
          const db = await getDb();

          // Find the booking by nylasBotId
          let booking = await db.collection("bookings").findOne({ nylasBotId: botId });

          if (!booking) {
            console.warn(`[Nylas Webhook] No booking found for Nylas bot ${botId}`);
            return new Response("OK", { status: 200 });
          }

          console.log(`[Nylas Webhook] Found booking ${booking._id} for bot ${botId}`);

          const updateData: any = {};
          let hasUpdates = false;

          // Nylas events might be 'notetaker.created', 'notetaker.updated', 'notetaker.deleted', 'notetaker.media'
          // Just extract whatever is available in the object
          
          if (botData.status) {
             updateData.botStatus = botData.status;
             hasUpdates = true;
             if (botData.status === 'in_waiting_room') {
               console.log("[Nylas Webhook] 🔔 Bot is in waiting room — consultant must admit it");
             }
          }

          if (botData.media) {
            if (botData.media.recording_url) {
              updateData.recordingUrl = botData.media.recording_url;
              hasUpdates = true;
            }
            if (botData.media.transcript_url) {
              updateData.transcriptUrl = botData.media.transcript_url;
              hasUpdates = true;
            }
            if (botData.media.summary) {
              updateData.summary = botData.media.summary;
              hasUpdates = true;
            }
          }

          if (hasUpdates) {
            await db.collection("bookings").updateOne(
              { _id: booking._id },
              { $set: updateData }
            );
            console.log(`[Nylas Webhook] ✅ Updated booking ${booking._id}`);
          }

          return new Response("OK", { status: 200 });
        } catch (err: any) {
          console.error("[Nylas Webhook Error]", err);
          return new Response("Internal Server Error", { status: 500 });
        }
      }
    }
  }
});
