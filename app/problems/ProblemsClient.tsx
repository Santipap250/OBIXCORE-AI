"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import problemsData from "@/data/problems.json";
import type { Problem } from "@/types";
import CopyButton from "@/components/CopyButton";
import Badge from "@/components/Badge";

const problems = problemsData as Problem[];

const CATEGORIES = [
  { value: "all", label: "ทั้งหมด", icon: "🔍" },
  { value: "flight", label: "การบิน", icon: "🚁" },
  { value: "video", label: "วิดีโอ/FPV", icon: "📡" },
  { value: "power", label: "ระบบไฟ", icon: "⚡" },
  { value: "mechanical", label: "เครื่องกล", icon: "🔧" },
] as const;

const SEVERITY_CONFIG = {
  high:   { label: "ด่วน",    color: "text-red-DEFAULT   bg-red-muted   border-red-DEFAULT/40"   },
  medium: { label: "ปานกลาง", color: "text-amber-DEFAULT bg-amber-muted border-amber-DEFAULT/40" },
  low:    { label: "ต่ำ",      color: "text-green-DEFAULT bg-green-muted border-green-DEFAULT/40" },
};

function ProblemsPageInner() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");

  const [category, setCategory] = useState<string>("all");
  const [selected, setSelected] = useState<Problem | null>(null);
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set([0]));

  const filtered = category === "all"
    ? problems
    : problems.filter((p) => p.category === category);

  const selectProblem = (p: Problem) => {
    setSelected(p);
    setOpenSteps(new Set([0]));
    setTimeout(() => document.getElementById("problem-detail")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  // Deep-linking support: FPV Doctor and Blackbox Analyzer findings link
  // here via "/problems?focus=<problemId>". On mount, if that param matches
  // a known problem, auto-select it just like clicking it in the list would.
  useEffect(() => {
    if (!focusId) return;
    const match = problems.find((p) => p.id === focusId);
    if (match) selectProblem(match);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);

  const toggleStep = (i: number) => {
    setOpenSteps((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-5 bg-amber-DEFAULT rounded-full" />
          <h1 className="font-orbitron font-bold text-lg text-text tracking-wide">Problem Solver</h1>
        </div>
        <p className="text-sm text-text-muted font-sarabun ml-3.5">
          เลือกอาการที่เจอ → ได้ขั้นตอนแก้ไขทีละ step
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none" role="group" aria-label="กรองตามหมวดหมู่">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            aria-pressed={category === c.value}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono border transition-all ${
              category === c.value
                ? "border-amber-DEFAULT bg-amber-muted text-amber-DEFAULT"
                : "border-bg-border bg-bg-surface text-text-muted hover:bg-bg-elevated"
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Problem list */}
      <div className="space-y-2 mb-6">
        {filtered.length === 0 && (
          <p className="text-center text-text-faint font-sarabun py-8 text-sm">ไม่พบปัญหาในหมวดนี้</p>
        )}
        {filtered.map((p) => {
          const sev = SEVERITY_CONFIG[p.severity];
          const isSelected = selected?.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => selectProblem(p)}
              className={`w-full text-left p-4 rounded-xl border transition-all active:scale-99 ${
                isSelected
                  ? "border-amber-DEFAULT/60 bg-amber-muted/20"
                  : "border-bg-border bg-bg-surface hover:border-bg-border hover:bg-bg-elevated"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-sarabun text-text font-medium leading-snug">{p.symptom}</p>
                  <p className="text-xs text-text-muted font-sarabun mt-1 leading-relaxed line-clamp-2">{p.description}</p>
                </div>
                <span className={`flex-shrink-0 text-[10px] font-mono px-2 py-1 rounded border mt-0.5 ${sev.color}`}>
                  {sev.label}
                </span>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="default">{p.category}</Badge>
                <span className="text-[10px] font-mono text-text-faint">{p.steps.length} ขั้นตอน</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="animate-slide-up" id="problem-detail">
          <div className="h-px bg-bg-border mb-5" />

          {/* Title */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-sarabun font-semibold text-base text-text leading-snug">{selected.symptom}</h2>
              <p className="text-xs text-text-muted font-sarabun mt-1 leading-relaxed">{selected.description}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-bg-elevated text-text-faint hover:text-text-muted transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Causes */}
          <div className="p-4 rounded-xl bg-amber-muted/30 border border-amber-DEFAULT/20 mb-4">
            <p className="text-xs font-mono text-amber-DEFAULT uppercase tracking-wider mb-2">สาเหตุที่พบบ่อย</p>
            <ul className="space-y-1">
              {selected.causes.map((c, i) => (
                <li key={i} className="flex gap-2 text-xs font-sarabun text-text leading-relaxed">
                  <span className="text-amber-DEFAULT flex-shrink-0 mt-0.5">→</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="mb-3">
            <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3">ขั้นตอนแก้ไข</p>
            <div className="space-y-2">
              {selected.steps.map((step, i) => {
                const isOpen = openSteps.has(i);
                return (
                  <div key={i} className={`rounded-xl border overflow-hidden transition-all ${isOpen ? "border-green-DEFAULT/30 bg-green-muted/10" : "border-bg-border bg-bg-surface"}`}>
                    <button
                      onClick={() => toggleStep(i)}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-orbitron font-bold border ${isOpen ? "bg-green-DEFAULT text-bg-DEFAULT border-green-DEFAULT" : "bg-bg-elevated text-text-muted border-bg-border"}`}>
                        {step.order}
                      </span>
                      <span className="flex-1 text-sm font-sarabun text-text font-medium">{step.title}</span>
                      <svg className={`w-4 h-4 text-text-faint transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 space-y-3">
                        <p className="text-xs font-sarabun text-text-muted leading-relaxed">{step.description}</p>

                        {step.action && (
                          <div className="rounded-lg overflow-hidden border border-green-DEFAULT/20">
                            <div className="flex items-center justify-between px-3 py-2 bg-bg-elevated border-b border-bg-border">
                              <span className="text-[10px] font-mono text-text-faint uppercase">CLI Command</span>
                              <CopyButton text={step.action} size="sm" />
                            </div>
                            <pre className="px-3 py-2.5 text-xs font-mono text-green-DEFAULT bg-bg-surface leading-relaxed whitespace-pre-wrap">
                              {step.action}
                            </pre>
                          </div>
                        )}

                        {step.warning && (
                          <div className="flex gap-2 p-2.5 rounded-lg bg-red-muted border border-red-DEFAULT/20">
                            <span className="text-red-DEFAULT text-sm flex-shrink-0">⚠</span>
                            <p className="text-xs font-sarabun text-red-DEFAULT leading-relaxed">{step.warning}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap pt-2">
            {selected.tags.map((tag) => (
              <Badge key={tag} variant="outline">#{tag}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// useSearchParams() requires a Suspense boundary in the App Router. This
// wrapper is the new default export; ProblemsPageInner holds all the
// original page logic and JSX, unchanged.
export default function ProblemsClient() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-6 text-sm text-text-muted">Loading…</div>}>
      <ProblemsPageInner />
    </Suspense>
  );
}
