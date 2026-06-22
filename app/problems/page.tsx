// app/problems/page.tsx
// Server Component wrapper exporting route metadata — see app/wizard/page.tsx
// for the full rationale. ProblemsClient.tsx contains the original page
// logic plus the deep-linking (?focus=) and accessibility additions made
// earlier in this pass; nothing further changed here.
import type { Metadata } from "next";
import ProblemsClient from "./ProblemsClient";

export const metadata: Metadata = {
  title: "Problem Solver",
  description: "เลือกอาการที่เจอ → ได้ขั้นตอนแก้ไขทีละ step พร้อม Betaflight CLI command",
};

export default function ProblemsPage() {
  return <ProblemsClient />;
}
