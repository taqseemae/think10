const fs = require('fs');
const file = 'src/lib/server-actions.ts';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove _scheduleRecallBot invocation from createBookingFn
code = code.replace(/\/\/ Schedule the Recall bot automatically[\s\S]*?catch \(e: any\) {[\s\S]*?}/, '// Fireflies.ai will automatically join the Google Meet session based on the Calendar event.');

// 2. Replace _scheduleRecallBot and everything below it until the end of the file
const recallSectionStart = code.indexOf('// --- Recall.ai Integration ---');
if (recallSectionStart !== -1) {
  const firefliesCode = `// --- Fireflies.ai Integration ---

export const callBotNowFn = createServerFn({ method: 'POST' })
  .validator((d: { bookingId: string; meetLink: string }) => d)
  .handler(async ({ data }) => {
    // Fireflies automatically joins meetings from the connected calendar.
    // Manual invocation is not supported or required via their API.
    console.log("callBotNowFn invoked: Fireflies joins automatically via Calendar integration.");
    return { success: true, message: "Fireflies joins automatically." };
  });

export const fetchFirefliesDataFn = createServerFn({ method: 'POST' })
  .validator((d: { bookingId: string; title: string }) => d)
  .handler(async ({ data }) => {
    const { requireAuth } = await import('@/lib/server-utils');
    const token = await requireAuth();
    if (!process.env.FIREFLIES_API_KEY) {
      console.warn("FIREFLIES_API_KEY is not set.");
      return null;
    }

    try {
      // 1. Find the meeting transcript ID by title
      const searchRes = await fetch("https://api.fireflies.ai/graphql", {
        method: "POST",
        headers: {
          "Authorization": \`Bearer \${process.env.FIREFLIES_API_KEY}\`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: \`
            query Transcripts($title: String!) {
              transcripts(title: $title, limit: 1) {
                id
                title
              }
            }
          \`,
          variables: { title: data.title }
        })
      });
      
      if (!searchRes.ok) {
        console.error("Fireflies API Error:", await searchRes.text());
        return null;
      }
      
      const searchData = await searchRes.json();
      const transcripts = searchData?.data?.transcripts;
      if (!transcripts || transcripts.length === 0) {
         return null; // Meeting not found or not processed yet
      }
      
      const transcriptId = transcripts[0].id;
      
      // 2. Fetch transcript details (video_url, sentences)
      const detailsRes = await fetch("https://api.fireflies.ai/graphql", {
        method: "POST",
        headers: {
          "Authorization": \`Bearer \${process.env.FIREFLIES_API_KEY}\`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: \`
            query Transcript($id: String!) {
              transcript(id: $id) {
                id
                video_url
                sentences {
                  text
                  speaker_name
                }
              }
            }
          \`,
          variables: { id: transcriptId }
        })
      });
      
      if (!detailsRes.ok) return null;
      const detailsData = await detailsRes.json();
      const transcriptObj = detailsData?.data?.transcript;
      if (!transcriptObj) return null;
      
      const db = await (await import('@/lib/mongodb')).getDb();
      const { ObjectId } = await import('mongodb');
      
      const updateData: any = {};
      let hasUpdates = false;

      if (transcriptObj.video_url) {
        updateData.recordingUrl = transcriptObj.video_url;
        hasUpdates = true;
      }
      
      if (transcriptObj.sentences && transcriptObj.sentences.length > 0) {
        const transcriptText = transcriptObj.sentences
          .map((s: any) => \`\${s.speaker_name || 'Unknown'}: \${s.text}\`)
          .join('\\n');
        
        // Use a generic summary prompt if no structured action items exist
        const aiPrompt = \`Summarize this meeting transcript and list action items:\\n\\n\${transcriptText}\`;
        
        updateData.report = {
          summary: transcriptText.substring(0, 1000) + '...', // Simple fallback
          actionItems: []
        };
        hasUpdates = true;
      }

      if (hasUpdates) {
        await db.collection('bookings').updateOne(
          { _id: new ObjectId(data.bookingId) },
          { $set: updateData }
        );
      }
      
      return updateData;
    } catch (e) {
      console.error("[Think10] Error fetching Fireflies data:", e);
      return null;
    }
  });
`;
  code = code.substring(0, recallSectionStart) + firefliesCode;
}

fs.writeFileSync(file, code);
console.log('Modified server-actions.ts');
