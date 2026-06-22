import Link from "next/link";
import type { DoctorFinding } from "@/types";
import { getProblemById } from "@/lib/doctor/diagnose";

const SEVERITY_COLOR: Record<string, string> = {
  high: "text-red-DEFAULT border-red-DEFAULT/40 bg-red-muted",
  medium: "text-amber-DEFAULT border-amber-DEFAULT/40 bg-amber-muted",
  low: "text-green-DEFAULT border-green-DEFAULT/40 bg-green-muted",
};

export default function DoctorFindingCard({ finding }: { finding: DoctorFinding }) {
  const problem = getProblemById(finding.problemId);
  if (!problem) return null;

  const confidencePct = Math.round(finding.confidence * 100);

  return (
    <Link
      href={`/problems?focus=${problem.id}`}
      className="block rounded-xl border border-bg-border bg-bg-surface p-4 hover:border-pink-DEFAULT/40 hover:bg-bg-elevated transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-sarabun text-text font-medium leading-snug">{problem.symptom}</p>
          <p className="text-xs text-text-muted font-sarabun mt-1 leading-relaxed line-clamp-2">
            {problem.description}
          </p>
        </div>
        <span className={`shrink-0 text-[10px] font-mono px-2 py-1 rounded border ${SEVERITY_COLOR[problem.severity]}`}>
          {confidencePct}% match
        </span>
      </div>

      {/* Confidence bar — gives an at-a-glance sense of match strength
          beyond the percentage label, useful for quickly scanning a list
          of 3-5 ranked findings. */}
      <div className="mt-3 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-DEFAULT to-purple-DEFAULT"
          style={{ width: `${confidencePct}%` }}
        />
      </div>

      {finding.matchedKeywords.length > 0 && (
        <div className="mt-2 flex gap-1 flex-wrap">
          {finding.matchedKeywords.slice(0, 5).map((kw) => (
            <span key={kw} className="text-[10px] font-mono text-text-faint bg-bg-elevated px-1.5 py-0.5 rounded">
              {kw}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
