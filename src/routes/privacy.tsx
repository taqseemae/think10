import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  component: () => (
    <LegalPage
      title="Privacy Policy"
      updated="September 2026"
      intro="How Think10 collects, uses and protects your information."
    >
      <h2>What we collect</h2>
      <p>
        We collect the information you provide directly (name, email, business details), the
        conversations you have with Zyne, session recordings you consent to, and standard technical
        data (device, browser, IP).
      </p>
      <h2>How we use it</h2>
      <p>
        To provide the Think10 service — including Zyne responses, expert matching, session
        preparation and product improvement. We do not sell your data. We do not train third-party
        foundation models on your business content.
      </p>
      <h2>Sharing</h2>
      <p>
        Session and pre-session context is shared only with the expert you book. Aggregated,
        non-identifiable insights may inform Think10 product development.
      </p>
      <h2>Your rights</h2>
      <p>
        You can request export or deletion of your data at any time by contacting privacy@think10.ae
        (placeholder).
      </p>
      <p>
        <em>
          This is a prototype policy. Final legal wording will be provided by Think10's counsel.
        </em>
      </p>
    </LegalPage>
  ),
  head: () => ({
    meta: [
      { title: "Privacy Policy | Think10" },
      { name: "description", content: "Think10 privacy policy." },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
});
