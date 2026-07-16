import { createFileRoute, redirect } from "@tanstack/react-router";

// Signup is now handled inside /login with a slide animation.
// This route simply redirects to /login so old links don't break.
export const Route = createFileRoute("/signup")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
