// app/doctor/page.tsx
// Server Component wrapper exporting route metadata — see app/wizard/page.tsx
// for the rationale on the Server/Client split pattern used across this app.
import type { Metadata } from "next";
import DoctorClient from "./DoctorClient";

export const metadata: Metadata = {
  title: "FPV Doctor AI",
  description: "อธิบายอาการโดรนที่เจอ → ได้ผลวินิจฉัยพร้อมระดับความเชื่อมั่นและขั้นตอนแก้ไข จากฐานข้อมูลปัญหา FPV",
};

export default function DoctorPage() {
  return <DoctorClient />;
}
