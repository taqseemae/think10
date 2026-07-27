/**
 * email.ts
 * Server-side only — sends transactional emails via Resend.
 * Never import in client components.
 */

import { Resend } from 'resend';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_placeholder_replace_with_real_key') {
    console.warn('[Think10 Email] RESEND_API_KEY not configured — skipping email send.');
    return null;
  }
  return new Resend(apiKey);
}

const FROM = process.env.EMAIL_FROM || 'Think10 Advisory <bookings@think10.ae>';

export interface BookingEmailData {
  userName: string;
  userEmail: string;
  consultantName: string;
  consultantEmail: string;
  topic: string;
  startTime: string; // ISO8601
  endTime: string;   // ISO8601
  timezone: string;
  googleMeetLink: string;
  bookingId: string;
}

function formatDateTime(iso: string, timezone: string = 'Asia/Dubai'): string {
  try {
    return new Intl.DateTimeFormat('en-AE', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── Booking Confirmation to User ────────────────────────────────────────────

export async function sendBookingConfirmationToUser(data: BookingEmailData): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const dateStr = formatDateTime(data.startTime, data.timezone);

  await resend.emails.send({
    from: FROM,
    to: data.userEmail,
    subject: `✅ Your Think10 Session is Confirmed — ${data.consultantName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
        <div style="background: #0a2540; padding: 24px 32px;">
          <img src="https://think10.ae/logo/t10-brand-logo.svg" alt="Think10" height="32" />
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #0a2540; margin-top: 0;">Your session is confirmed, ${data.userName}! 🎉</h2>
          <p style="color: #555;">Your strategy session with <strong>${data.consultantName}</strong> has been scheduled.</p>
          
          <div style="background: #f0faf5; border: 1px solid #22c55e; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #0a2540;"><strong>📅 Date & Time:</strong><br>${dateStr} (${data.timezone})</p>
            <p style="margin: 8px 0; color: #0a2540;"><strong>🎯 Topic:</strong><br>${data.topic}</p>
            <p style="margin: 8px 0; color: #0a2540;"><strong>👤 Advisor:</strong><br>${data.consultantName}</p>
            <p style="margin: 8px 0 0; color: #0a2540;"><strong>🔗 Meeting Link:</strong><br>
              <a href="${data.googleMeetLink}" style="color: #059669;">${data.googleMeetLink}</a>
            </p>
          </div>
          
          <a href="${data.googleMeetLink}" style="display: inline-block; background: #059669; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-bottom: 24px;">
            Join Google Meet →
          </a>
          
          <p style="color: #888; font-size: 13px;">You can also view and manage your sessions in your <a href="https://think10.ae/dashboard/sessions" style="color: #059669;">Think10 Dashboard</a>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #aaa; font-size: 11px;">Think10 Advisory — Dubai, UAE | <a href="https://think10.ae" style="color: #aaa;">think10.ae</a></p>
        </div>
      </div>
    `,
  });
}

// ─── Booking Notification to Consultant ──────────────────────────────────────

export async function sendBookingNotificationToConsultant(data: BookingEmailData): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const dateStr = formatDateTime(data.startTime, data.timezone);

  await resend.emails.send({
    from: FROM,
    to: data.consultantEmail,
    subject: `📅 New Session Booked — ${data.userName} — ${dateStr}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
        <div style="background: #0a2540; padding: 24px 32px;">
          <img src="https://think10.ae/logo/t10-brand-logo.svg" alt="Think10" height="32" />
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #0a2540; margin-top: 0;">New Session Booked, ${data.consultantName}!</h2>
          <p style="color: #555;"><strong>${data.userName}</strong> has booked a strategy session with you.</p>
          
          <div style="background: #f0faf5; border: 1px solid #22c55e; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #0a2540;"><strong>📅 Date & Time:</strong><br>${dateStr} (${data.timezone})</p>
            <p style="margin: 8px 0; color: #0a2540;"><strong>🎯 Topic:</strong><br>${data.topic}</p>
            <p style="margin: 8px 0; color: #0a2540;"><strong>👤 Client:</strong><br>${data.userName} (${data.userEmail})</p>
            <p style="margin: 8px 0 0; color: #0a2540;"><strong>🔗 Meeting Link:</strong><br>
              <a href="${data.googleMeetLink}" style="color: #059669;">${data.googleMeetLink}</a>
            </p>
          </div>
          
          <a href="${data.googleMeetLink}" style="display: inline-block; background: #059669; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-bottom: 24px;">
            Join Google Meet →
          </a>
          
          <p style="color: #888; font-size: 13px;">Manage your sessions in your <a href="https://think10.ae/consultant/bookings" style="color: #059669;">Consultant Dashboard</a>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #aaa; font-size: 11px;">Think10 Advisory — Dubai, UAE</p>
        </div>
      </div>
    `,
  });
}

// ─── Cancellation Email ───────────────────────────────────────────────────────

export async function sendCancellationEmail(data: BookingEmailData, cancelledBy: 'user' | 'consultant'): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const dateStr = formatDateTime(data.startTime, data.timezone);
  const recipients = [data.userEmail, data.consultantEmail];

  for (const to of recipients) {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `❌ Session Cancelled — ${data.consultantName} × ${data.userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0a2540; padding: 24px 32px;">
            <img src="https://think10.ae/logo/t10-brand-logo.svg" alt="Think10" height="32" />
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #0a2540;">Session Cancelled</h2>
            <p style="color: #555;">The session scheduled for <strong>${dateStr}</strong> between <strong>${data.userName}</strong> and <strong>${data.consultantName}</strong> has been cancelled by the ${cancelledBy === 'user' ? 'client' : 'advisor'}.</p>
            <p style="color: #555;">If this was unexpected, please contact Think10 support or rebook a new session.</p>
            <a href="https://think10.ae/dashboard/advisors" style="display: inline-block; background: #0a2540; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Book a New Session →</a>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #aaa; font-size: 11px;">Think10 Advisory — Dubai, UAE</p>
          </div>
        </div>
      `,
    });
  }
}

// ─── Reschedule Email ─────────────────────────────────────────────────────────

export async function sendRescheduleEmail(data: BookingEmailData, oldStartTime: string): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const newDateStr = formatDateTime(data.startTime, data.timezone);
  const oldDateStr = formatDateTime(oldStartTime, data.timezone);
  const recipients = [data.userEmail, data.consultantEmail];

  for (const to of recipients) {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `🔄 Session Rescheduled — ${data.consultantName} × ${data.userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0a2540; padding: 24px 32px;">
            <img src="https://think10.ae/logo/t10-brand-logo.svg" alt="Think10" height="32" />
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #0a2540;">Session Rescheduled</h2>
            <p style="color: #555;">Your session has been moved to a new time.</p>
            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; color: #555;"><s>Old time: ${oldDateStr}</s></p>
            </div>
            <div style="background: #f0faf5; border: 1px solid #22c55e; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; color: #0a2540;"><strong>New time: ${newDateStr}</strong></p>
              <p style="margin: 8px 0 0;"><a href="${data.googleMeetLink}" style="color: #059669;">${data.googleMeetLink}</a></p>
            </div>
            <a href="${data.googleMeetLink}" style="display: inline-block; background: #059669; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Join Updated Meeting →</a>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #aaa; font-size: 11px;">Think10 Advisory — Dubai, UAE</p>
          </div>
        </div>
      `,
    });
  }
}
