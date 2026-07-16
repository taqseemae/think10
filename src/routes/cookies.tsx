import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/cookies")({
  component: () => (
    <LegalPage
      title="Cookie Policy"
      updated="September 2026"
      intro="How Think10 uses cookies and similar technologies."
    >
      <h2>What we use</h2>
      <p>
        Essential cookies to keep you logged in and remember your preferences. Analytics cookies to
        understand which parts of the product are useful.
      </p>
      <h2>Managing cookies</h2>
      <p>
        You can manage or refuse non-essential cookies from the banner at the bottom of the page, or
        in your browser settings.
      </p>
    </LegalPage>
  ),
  head: () => ({
    meta: [
      { title: "Cookie Policy | Think10" },
      { name: "description", content: "Think10 cookie policy." },
    ],
    links: [{ rel: "canonical", href: "/cookies" }],
  }),
});
