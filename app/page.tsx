// app/page.tsx
// The root route now redirects to /dashboard, which has replaced the old
// homepage as the product's real entry point (see app/dashboard/page.tsx).
//
// Why a server-side redirect instead of keeping the old marketing page or
// doing a client-side `router.push` in useEffect:
//   1. Zero duplicate content for SEO — one canonical "home" experience.
//   2. redirect() runs on the server before any HTML ships, so there's no
//      flash of the old page before bouncing to the new one (a client-side
//      redirect would render, hydrate, then navigate — wasted work and a
//      visible flicker).
//   3. Anyone with the old root URL bookmarked, or any external link
//      pointing at "/", lands on the current product home automatically.
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
