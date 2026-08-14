import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "@/lib/mongodb";

export const Route = createFileRoute("/api/nylas-media/$bookingId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const { bookingId } = params;
          const { ObjectId } = await import("mongodb");
          const db = await getDb();
          
          const booking = await db.collection("bookings").findOne({ _id: new ObjectId(bookingId) });
          
          if (!booking || !booking.nylasBotId) {
            return new Response("Booking or Bot ID not found", { status: 404 });
          }
          
          // Fetch fresh media URLs from Nylas API
          const response = await fetch(`https://api.us.nylas.com/v3/grants/${process.env.NYLAS_GRANT_ID}/notetakers/${booking.nylasBotId}/media`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${process.env.NYLAS_API_KEY}`
            }
          });
          
          if (!response.ok) {
            const err = await response.text();
            console.error("[Nylas Media Refresh Error]", err);
            
            // Fallback to the stale URL if Nylas API fails (just in case it hasn't expired)
            if (booking.recordingUrl) {
                return Response.redirect(booking.recordingUrl, 302);
            }
            return new Response("Failed to fetch fresh media from Nylas", { status: 500 });
          }
          
          const data = await response.json();
          const freshRecordingUrl = data.data?.recording;
          
          if (!freshRecordingUrl) {
             // Fallback
             if (booking.recordingUrl) return Response.redirect(booking.recordingUrl, 302);
             return new Response("Media not ready yet", { status: 404 });
          }
          
          // Save the fresh URL back to DB (optional, but good for caching)
          await db.collection("bookings").updateOne(
            { _id: booking._id },
            { $set: { recordingUrl: freshRecordingUrl } }
          );
          
          // 302 Redirect to the fresh video stream URL
          return Response.redirect(freshRecordingUrl, 302);
          
        } catch (error) {
          console.error("API Nylas Media error:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      }
    }
  }
});
