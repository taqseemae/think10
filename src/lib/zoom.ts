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

  // Generate a 6-digit passcode so Zoom does NOT force Waiting Room ON
  const passcode = Math.floor(100000 + Math.random() * 900000).toString();

  const payload = {
    topic: `Think10 Strategy Session: ${topic || 'Consultation'}`,
    type: 2, // Scheduled meeting
    start_time: formattedStartTime,
    duration: durationMinutes,
    password: passcode, // Passcode satisfies Zoom security policy so waiting_room: false is respected!
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: true, // Allow participants & bots to join before host
      jbh_time: 0, // Join anytime
      waiting_room: false, // Disables waiting room completely!
      mute_upon_entry: false,
      auto_recording: 'cloud', // Natively record to Zoom Cloud automatically!
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
  let joinUrl = meetingData.join_url || '';
  if (joinUrl.includes("zoom.us")) {
    joinUrl = joinUrl.replace(/https:\/\/[a-z0-9]+\.zoom\.us/i, "https://zoom.us");
  }

  return {
    joinUrl,
    startUrl: meetingData.start_url || '',
    id: meetingData.id?.toString() || '',
  };
}
