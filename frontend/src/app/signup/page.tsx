import { redirect } from "next/navigation";

export default function SignupPage() {
  // Signup is now handled inside /login with a slide animation.
  // This route simply redirects to /login so old links don't break.
  redirect("/login");
}
