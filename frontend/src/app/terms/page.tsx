import { LegalPage } from "@/components/site/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="September 2026"
      intro="The terms that apply when you use Think10."
    >
      <h2>Using Think10</h2>
      <p>
        Think10 provides an AI advisor (Zyne), expert booking and Command Centre workspace. It is
        provided as an advisory tool and does not constitute legal, financial, tax or investment
        advice.
      </p>
      <h2>Your responsibility</h2>
      <p>
        All decisions you make regarding your business are your own. You are responsible for
        validating information before acting on it.
      </p>
      <h2>Payments</h2>
      <p>
        Pricing shown is indicative during preview. Final pricing will be presented before any
        charge is made.
      </p>
      <h2>Termination</h2>
      <p>
        You may cancel your account at any time. We may suspend accounts that violate these terms.
      </p>
      <p>
        <em>Prototype terms — final wording to be provided.</em>
      </p>
    </LegalPage>
  );
}
