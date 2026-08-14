import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "@/lib/mongodb";

export const Route = createFileRoute("/api/nylas-media/$bookingId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const { bookingId } = params;
          const url = new URL(request.url);
          const mediaType = url.searchParams.get("type") || "recording"; // "recording" or "transcript"
          
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
            let fallbackUrl = mediaType === "transcript" ? booking.transcriptUrl : booking.recordingUrl;
            if (fallbackUrl && typeof fallbackUrl === 'object') {
               fallbackUrl = fallbackUrl.url || fallbackUrl.download_url || fallbackUrl.link;
            }
            if (fallbackUrl && typeof fallbackUrl === 'string') {
                return Response.redirect(fallbackUrl, 302);
            }
            return new Response(`Failed to fetch fresh ${mediaType} from Nylas`, { status: 500 });
          }
          
          const data = await response.json();
          let targetUrl;
          
          // Handle case where data.data is an array (Nylas v3 format)
          if (Array.isArray(data.data)) {
             const mediaItem = data.data.find((item: any) => item.type === mediaType || item.media_type === mediaType);
             if (mediaItem) targetUrl = mediaItem.url || mediaItem.download_url || mediaItem.link;
          } else {
             targetUrl = data.data?.[mediaType];
          }
          
          // Nylas might return an object { url: "..." } instead of a string
          if (targetUrl && typeof targetUrl === 'object') {
             targetUrl = targetUrl.url || targetUrl.download_url || targetUrl.link;
          }
          
          if (!targetUrl || typeof targetUrl !== 'string') {
             // Fallback
             let fallbackUrl = mediaType === "transcript" ? booking.transcriptUrl : booking.recordingUrl;
             if (fallbackUrl && typeof fallbackUrl === 'object') {
                fallbackUrl = fallbackUrl.url || fallbackUrl.download_url || fallbackUrl.link;
             }
             if (fallbackUrl && typeof fallbackUrl === 'string') {
                 return Response.redirect(fallbackUrl, 302);
             }
             return new Response(`${mediaType} not ready yet`, { status: 404 });
          }
          
          // Save the fresh URL back to DB (optional, but good for caching)
          const updateField = mediaType === "transcript" ? "transcriptUrl" : "recordingUrl";
          await db.collection("bookings").updateOne(
            { _id: booking._id },
            { $set: { [updateField]: targetUrl } }
          );
          
          // 302 Redirect to the fresh video stream URL
          return Response.redirect(targetUrl, 302);
          
        } catch (error) {
          console.error("API Nylas Media error:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      }
    }
  }
});
