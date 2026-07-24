import { LegalPage } from "@/components/site/LegalPage";

export default function RecordingConfidentialityPage() {
  return (
    <LegalPage
      title="Recording & Confidentiality"
      updated="September 2026"
      intro="How Think10 handles expert sessions, recordings and confidential business information."
    >
      <h2>Confidentiality</h2>
      <p>
        Every Think10 expert operates under a written confidentiality agreement. Your business
        information, financials and strategy discussed in sessions are treated as confidential.
      </p>
      <h2>Recordings</h2>
      <p>
        Sessions may be recorded with your explicit consent. Recordings are stored in your Command
        Centre and are visible only to you and the expert on the call.
      </p>
      <h2>Deletion</h2>
      <p>
        You can delete session recordings and transcripts at any time. Deletions are permanent
        within 30 days.
      </p>
      <h2>Zyne conversations</h2>
      <p>
        Your Zyne conversations are stored in your account to preserve context. They are not shared
        with experts unless you explicitly attach them to a session brief.
      </p>
    </LegalPage>
  );
}
