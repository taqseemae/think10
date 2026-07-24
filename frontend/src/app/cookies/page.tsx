import { LegalPage } from "@/components/site/LegalPage";

export default function CookiesPage() {
  return (
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
  );
}
