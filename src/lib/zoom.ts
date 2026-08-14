/**
 * zoom.ts
 * Server-side helper to generate Zoom meeting links using Zoom Server-to-Server OAuth.
 * Requires ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET in environment variables.
 */

async function getZoomAccessToken(): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID?.trim();
  const clientId = process.env.ZOOM_CLIENT_ID?.trim();
  const clientSecret = process.env.ZOOM_CLIENT_SECRET?.trim();

  if (!accountId || !clientId || !clientSecret) {
    throw new Error(`Zoom environment variables missing! Received: accountId=${!!accountId}, clientId=${!!clientId}, clientSecret=${!!clientSecret}`);
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
    console.error('[Zoom Auth Error]', response.status, errorText);
    throw new Error(`Zoom Token Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function createZoomMeeting(topic: string, startTime?: string, durationMinutes: number = 60): Promise<{ joinUrl: string; startUrl: string; id: string }> {
  const token = await getZoomAccessToken();

  let formattedStartTime = new Date().toISOString();
  if (startTime) {
    try {
      const parsed = new Date(startTime);
      if (!isNaN(parsed.getTime())) {
        formattedStartTime = parsed.toISOString();
      }
    } catch {}
  }

  const payload = {
    topic: `Think10 Strategy Session: ${topic || 'Consultation'}`,
    type: 2, // Scheduled meeting
    start_time: formattedStartTime,
    duration: durationMinutes,
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: true, // Allow participants & bots to join before host
      waiting_room: false, // Turn off waiting room so bot enters automatically!
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
    console.error('[Zoom Create Meeting Error]', response.status, err);
    throw new Error(`Zoom API Error (${response.status}): ${err}`);
  }

  const meetingData = await response.json();
  return {
    joinUrl: meetingData.join_url,
    startUrl: meetingData.start_url,
    id: meetingData.id?.toString() || '',
  };
}
