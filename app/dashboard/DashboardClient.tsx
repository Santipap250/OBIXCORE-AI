"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listProfiles, getActiveProfile } from "@/lib/storage/profiles";
import { listLogMeta } from "@/lib/blackbox/storage";
import type { DroneProfile, BlackboxLogMeta } from "@/types";
import { ToolCard } from "@/components/ui";

const MODULES = [
  {
    href: "/profiles",
    title: "My Drone Profiles",
    titleTh: "จัดการโดรนของฉัน",
    description: "บันทึกสเปกโดรนแต่ละลำ พร้อมค่าจูนล่าสุด เรียกใช้ซ้ำได้ทันที",
    accentColor: "cyan" as const,
    badge: "ใหม่",
  },
  {
    href: "/doctor",
    title: "FPV Doctor AI",
    titleTh: "วินิจฉัยอาการโดรน",
    description: "อธิบายอาการที่เจอ → ได้ผลวินิจฉัยพร้อมระดับความเชื่อมั่นและขั้นตอนแก้ไข",
    accentColor: "pink" as const,
    badge: "ใหม่",
  },
  {
    href: "/blackbox",
    title: "Blackbox Analyzer",
    titleTh: "วิเคราะห์ Blackbox Log",
    description: "อัปโหลด log (CSV) เพื่อตรวจ noise, propwash และอาการต่อแกน roll/pitch/yaw",
    accentColor: "purple" as const,
    badge: "ใหม่",
  },
  {
    href: "/wizard",
    title: "Tuning Wizard",
    titleTh: "ตั้งค่า PID อัตโนมัติ",
    description: "กรอกสเปกโดรน → ได้ค่า PID + Filter + Rates + CLI พร้อม copy",
    accentColor: "green" as const,
  },
  {
    href: "/problems",
    title: "Problem Solver",
    titleTh: "แก้ปัญหาโดรน",
    description: "เลือกอาการที่เจอ → ได้ขั้นตอนแก้ไขทีละ step พร้อม CLI command",
    accentColor: "amber" as const,
  },
  {
    href: "/calculator",
    title: "Calculator",
    titleTh: "คำนวณ Thrust / Flight Time",
    description: "คำนวณ thrust-to-weight, flight time, และ current draw โดยประมาณ",
    accentColor: "blue" as const,
  },
  {
    href: "/presets",
    title: "Preset Library",
    titleTh: "คลัง Preset พร้อมใช้",
    description: "ค่า PID + Rates + Filters ที่ผ่านการทดสอบจริง กด copy แล้ววางใน CLI ได้เลย",
    accentColor: "purple" as const,
  },
];

const toolIcons: Record<string, React.ReactNode> = {
  "/profiles": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L4 14h7l-1 8 10-14h-7l1-6z"/>
    </svg>
  ),
  "/doctor": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      <path d="M12 8v6M9 11h6"/>
    </svg>
  ),
  "/blackbox": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
    </svg>
  ),
  "/wizard": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
    </svg>
  ),
  "/problems": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  "/calculator": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="12" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/>
    </svg>
  ),
  "/presets": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
};

export default function DashboardClient() {
  // Client-side state read from localStorage. Initialized empty so server
  // and first client render match (avoids hydration mismatch warnings),
  // then populated in useEffect once we're definitely in the browser.
  const [profiles, setProfiles] = useState<DroneProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<DroneProfile | null>(null);
  const [logs, setLogs] = useState<BlackboxLogMeta[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfiles(listProfiles());
    setActiveProfile(getActiveProfile());
    setLogs(listLogMeta());
    setHydrated(true);
  }, []);

  const stats = [
    { value: hydrated ? String(profiles.length) : "—", label: "Drone Profiles", color: "text-cyan-DEFAULT" },
    { value: hydrated ? String(logs.length) : "—", label: "Blackbox Logs", color: "text-purple-DEFAULT" },
    { value: "5", label: "Problems DB", color: "text-amber-DEFAULT" },
    { value: "4", label: "Presets", color: "text-green-DEFAULT" },
  ];

  return (
    <div className="page-shell py-6">
      {/* Header */}
      <section className="hud-card overflow-hidden rounded-[1.75rem] p-5 md:p-6">
        <div className="absolute inset-x-0 top-0 h-1 color-strip" />
        <div className="absolute -right-12 top-8 h-40 w-40 rounded-full bg-blue-DEFAULT/10 blur-3xl" />
        <div className="absolute -left-14 bottom-6 h-44 w-44 rounded-full bg-pink-DEFAULT/10 blur-3xl" />

        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-green-DEFAULT/40 bg-green-muted/60 shadow-[0_0_30px_rgba(0,232,122,0.15)]">
              <span className="font-orbitron text-sm font-black tracking-[0.2em] text-green-DEFAULT">OX</span>
            </div>
            <div>
              <h1 className="font-orbitron text-2xl font-black tracking-[0.3em] text-text">
                DASHBOARD
              </h1>
              <p className="mt-1 text-[11px] font-mono tracking-[0.3em] text-green-DEFAULT">
                OBIXCORE AI · FPV COPILOT
              </p>
            </div>
          </div>

          <p className="max-w-2xl text-[15px] leading-relaxed text-text-muted">
            ศูนย์กลางควบคุมโดรน FPV ของคุณ — โปรไฟล์โดรน, วินิจฉัยอาการด้วย AI, วิเคราะห์ Blackbox และเครื่องมือจูนครบชุด
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="hud-panel rounded-2xl p-3 text-center">
                <div className={`font-orbitron text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="mt-1 text-[11px] text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active profile card */}
      <section className="mt-6">
        <div className="section-title mb-3">
          <h2 className="font-orbitron text-xs font-bold uppercase tracking-[0.35em] text-text-muted">
            Active Drone
          </h2>
          <div className="section-title__line" />
        </div>

        {hydrated && activeProfile ? (
          <Link
            href={`/profiles/${activeProfile.id}`}
            className="group hud-card flex items-center justify-between gap-4 rounded-2xl p-5 transition-all hover:border-cyan-DEFAULT/50"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-DEFAULT shadow-[0_0_14px_rgba(0,216,255,0.6)] animate-pulse-green" />
                <p className="font-orbitron text-sm font-semibold text-text truncate">{activeProfile.name}</p>
              </div>
              <p className="mt-1.5 text-xs font-mono text-text-muted">
                {activeProfile.spec.frameSize}mm · {activeProfile.spec.motorKV}KV · {activeProfile.spec.batteryS}S ·{" "}
                {(activeProfile.spec.propSize / 10).toFixed(1)}&quot; · {activeProfile.spec.weight}g
              </p>
            </div>
            <svg className="h-5 w-5 shrink-0 text-text-faint transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        ) : (
          <Link
            href="/profiles/new"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-dashed border-bg-border bg-bg-surface/60 p-5 transition-all hover:border-cyan-DEFAULT/50 hover:bg-cyan-muted/10"
          >
            <div>
              <p className="text-sm font-sarabun text-text font-medium">ยังไม่มีโดรนที่บันทึกไว้</p>
              <p className="mt-1 text-xs font-sarabun text-text-muted">เพิ่มโปรไฟล์โดรนลำแรกเพื่อเริ่มใช้ FPV Doctor และ Blackbox Analyzer แบบ spec-aware</p>
            </div>
            <span className="shrink-0 rounded-xl border border-cyan-DEFAULT/40 bg-cyan-muted/40 px-3 py-2 text-xs font-mono text-cyan-DEFAULT">
              + เพิ่มโดรน
            </span>
          </Link>
        )}
      </section>

      {/* Module grid */}
      <section className="mt-6">
        <div className="section-title mb-3">
          <h2 className="font-orbitron text-xs font-bold uppercase tracking-[0.35em] text-text-muted">
            All Modules
          </h2>
          <div className="section-title__line" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {MODULES.map((m) => (
            <ToolCard key={m.href} {...m} icon={toolIcons[m.href]} />
          ))}
        </div>
      </section>
    </div>
  );
}
