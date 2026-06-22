// app/blackbox/page.tsx
// Server Component wrapper exporting route metadata — see app/wizard/page.tsx
// for the rationale on the Server/Client split pattern used across this app.
import type { Metadata } from "next";
import BlackboxClient from "./BlackboxClient";

export const metadata: Metadata = {
  title: "Blackbox Analyzer",
  description: "อัปโหลด Betaflight Blackbox log (CSV) เพื่อตรวจ noise, propwash และอาการต่อแกน roll/pitch/yaw แบบทันที",
};

export default function BlackboxPage() {
  return <BlackboxClient />;
}
