import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "@/lib/mongodb";

export const Route = createFileRoute("/api/recall-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const event = await request.json();
          console.log("[Recall Webhook] Received event:", event.event);

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
            console.warn(
              `[Recall Webhook] No booking found for bot ${botId}`
            );
            return new Response("OK", { status: 200 });
          }

          const updateData: Record<string, any> = {};

          if (event.event === "bot.status_change") {
            const status = event.data?.status?.code;
            console.log(`[Recall Webhook] Bot status changed to: ${status}`);

            // When bot is done, fetch transcript and video
            if (status === "done" || status === "call_ended") {
              const RECALL_API_KEY = process.env.RECALL_API_KEY;
              if (RECALL_API_KEY) {
                // Fetch full bot details for video URL
                const botRes = await fetch(
                  `https://us-west-2.recall.ai/api/v1/bot/${botId}`,
                  {
                    headers: {
                      Authorization: `Token ${RECALL_API_KEY}`,
                    },
                  }
                );
                if (botRes.ok) {
                  const botData = await botRes.json();
                  if (botData.video_url) {
                    updateData.recordingUrl = botData.video_url;
                    updateData.status = "COMPLETED";
                  }
                }

                // Fetch transcript
                const transcriptRes = await fetch(
                  `https://us-west-2.recall.ai/api/v1/bot/${botId}/transcript`,
                  {
                    headers: {
                      Authorization: `Token ${RECALL_API_KEY}`,
                    },
                  }
                );
                if (transcriptRes.ok) {
                  const tData = await transcriptRes.json();
                  let transcriptText = "";
                  if (Array.isArray(tData)) {
                    transcriptText = tData
                      .map(
                        (u: any) => `${u.speaker || "Speaker"}: ${u.text || ""}`
                      )
                      .join("\n");
                  } else if (tData?.text) {
                    transcriptText = tData.text;
                  }
                  if (transcriptText) {
                    updateData.transcript = transcriptText;
                  }
                }
              }
            }
          }

          // Legacy event names support
          if (event.event === "bot.video_ready") {
            updateData.recordingUrl = event.data?.video_url;
            updateData.status = "COMPLETED";
          }

          if (event.event === "bot.transcript_ready") {
            const RECALL_API_KEY = process.env.RECALL_API_KEY;
            if (RECALL_API_KEY) {
              const transcriptRes = await fetch(
                `https://api.recall.ai/api/v1/bot/${botId}/transcript`,
                {
                  headers: { Authorization: `Token ${RECALL_API_KEY}` },
                }
              );
              if (transcriptRes.ok) {
                const tData = await transcriptRes.json();
                if (Array.isArray(tData)) {
                  updateData.transcript = tData
                    .map((u: any) => `${u.speaker || "Speaker"}: ${u.text || ""}`)
                    .join("\n");
                }
              }
            }
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
