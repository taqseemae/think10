import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/settings")({ component: Page });

function Page() {
  return (
    <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6">
      <h2 className="text-lg font-semibold text-[color:var(--t10-navy)]">Settings</h2>
      <p className="mt-1 text-sm text-[color:var(--t10-grey)]">
        Prototype — account, notifications and confidentiality controls would live here.
      </p>
      <div className="mt-6 space-y-4 text-sm">
        <Toggle label="Email me a weekly Zyne summary" />
        <Toggle label="Record expert sessions by default" />
        <Toggle label="Allow experts to view my business profile before sessions" defaultChecked />
      </div>
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between rounded-md border border-[color:var(--t10-border)] bg-white p-4">
      <span className="text-[color:var(--t10-navy)]">{label}</span>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-[color:var(--t10-emerald)]"
      />
    </label>
  );
}
