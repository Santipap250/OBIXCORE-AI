// app/dashboard/page.tsx
// Server Component wrapper exporting route metadata — see app/wizard/page.tsx
// for the rationale on the Server/Client split pattern used across this app.
import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "ศูนย์กลางควบคุมโดรน FPV — โปรไฟล์โดรน, FPV Doctor AI, Blackbox Analyzer และเครื่องมือจูนครบชุดในที่เดียว",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
