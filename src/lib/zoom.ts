/**
 * zoom.ts
 * Server-side helper to generate Zoom meeting links using Zoom Server-to-Server OAuth.
 * Requires ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET in environment variables.
 */

async function getZoomAccessToken(): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error("Zoom credentials (ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET) are missing.");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Zoom Auth Error]', errorText);
    throw new Error(`Failed to authenticate with Zoom: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function createZoomMeeting(topic: string, startTime: string, durationMinutes: number = 60): Promise<{ joinUrl: string; startUrl: string; id: string }> {
  const token = await getZoomAccessToken();

  const payload = {
    topic: `Think10 Strategy Session: ${topic}`,
    type: 2, // Scheduled meeting
    start_time: new Date(startTime).toISOString(),
    duration: durationMinutes,
    timezone: 'Asia/Dubai',
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: true, // Allow participant and bot to join before host
      jbh_time: 0, // Join anytime before host
      waiting_room: false, // Turn off waiting room so bot enters automatically without needing admission!
      auto_recording: 'none', // Nylas AI Notetaker handles recording
      approval_type: 2, // Automatically approve attendees
    },
  };

  const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('[Zoom Create Meeting Error]', err);
    throw new Error(`Zoom Meeting Creation Failed: ${err}`);
  }

  const meetingData = await response.json();
  return {
    joinUrl: meetingData.join_url,
    startUrl: meetingData.start_url,
    id: meetingData.id?.toString() || '',
  };
}
