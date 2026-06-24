// app/presets/page.tsx
// Server Component wrapper exporting route metadata — see app/wizard/page.tsx
// for the full rationale. PresetsClient.tsx is the original page logic
// unchanged, just renamed.
import type { Metadata } from "next";
import PresetsClient from "./PresetsClient";

export const metadata: Metadata = {
  title: "Preset Library",
  description: "ค่า PID, Rates และ Filters ที่ผ่านการทดสอบจริง สำหรับ frame หลายขนาดและหลายสไตล์การบิน",
};

export default function PresetsPage() {
  return <PresetsClient />;
}
