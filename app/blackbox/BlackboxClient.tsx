"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { saveLogMeta, listLogMeta } from "@/lib/blackbox/storage";
import { getProfile } from "@/lib/storage/profiles";
import type { BlackboxAnalysisResult, BlackboxLogMeta, DroneProfile } from "@/types";
import BlackboxUploader from "@/components/blackbox/BlackboxUploader";
import BlackboxResults from "@/components/blackbox/BlackboxResults";
import DoctorFindingCard from "@/components/doctor/DoctorFindingCard";

function BlackboxPageInner() {
  const searchParams = useSearchParams();
  const linkedProfileId = searchParams.get("profileId");

  const [linkedProfile, setLinkedProfile] = useState<DroneProfile | null>(null);
  const [history, setHistory] = useState<BlackboxLogMeta[]>([]);
  const [activeResult, setActiveResult] = useState<BlackboxAnalysisResult | null>(null);
  const [activeMeta, setActiveMeta] = useState<BlackboxLogMeta | null>(null);

  useEffect(() => {
    setHistory(listLogMeta());
    if (linkedProfileId) setLinkedProfile(getProfile(linkedProfileId));
  }, [linkedProfileId]);

  const handleComplete = (meta: BlackboxLogMeta, result: BlackboxAnalysisResult) => {
    const metaWithProfile: BlackboxLogMeta = {
      ...meta,
      profileId: linkedProfile?.id,
    };
    saveLogMeta(metaWithProfile);
    setHistory(listLogMeta());
    setActiveMeta(metaWithProfile);
    setActiveResult(result);
    setTimeout(() => {
      document.getElementById("blackbox-results")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-5 bg-purple-DEFAULT rounded-full" />
          <h1 className="font-orbitron font-bold text-lg text-text tracking-wide">Blackbox Analyzer</h1>
        </div>
        <p className="text-sm text-text-muted font-sarabun ml-3.5">
          อัปโหลด Blackbox log เพื่อตรวจ noise, propwash และอาการต่อแกน roll/pitch/yaw
        </p>
        {linkedProfile && (
          <p className="mt-2 ml-3.5 inline-flex items-center gap-1.5 hud-chip px-2.5 py-1 text-[11px] font-mono text-purple-DEFAULT">
            เชื่อมกับ: {linkedProfile.name}
          </p>
        )}
      </div>

      <BlackboxUploader onComplete={handleComplete} />

      {/* Scope note — honest about current capability */}
      <div className="mt-4 flex gap-2.5 rounded-xl border border-blue-DEFAULT/20 bg-blue-muted/15 p-3">
        <span className="text-blue-DEFAULT text-sm shrink-0">ℹ</span>
        <p className="text-[11px] font-sarabun text-blue-DEFAULT leading-relaxed">
          เวอร์ชันนี้รองรับ Betaflight Blackbox CSV export และวิเคราะห์ทั้งหมดในเบราว์เซอร์ของคุณ — ไม่มีการอัปโหลดไฟล์ขึ้นเซิร์ฟเวอร์
          การรองรับไฟล์ .bbl แบบ binary โดยตรงอยู่ระหว่างพัฒนา
        </p>
      </div>

      {/* Results */}
      {activeResult && activeMeta && (
        <div id="blackbox-results" className="mt-8 space-y-5 animate-slide-up">
          <div className="h-px bg-bg-border" />

          <div className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated border border-bg-border">
            <div className="min-w-0">
              <p className="text-xs font-mono text-text truncate">{activeMeta.fileName}</p>
              <p className="text-[10px] font-mono text-text-faint mt-0.5">
                {activeMeta.firmware ?? "Unknown firmware"}
                {activeMeta.loopRateHz ? ` · ${activeMeta.loopRateHz}Hz loop` : ""}
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-mono px-2 py-1 rounded border border-green-DEFAULT/30 bg-green-muted text-green-DEFAULT">
              Ready
            </span>
          </div>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest">Per-Axis Analysis</h2>
              <div className="flex-1 h-px bg-bg-border" />
            </div>
            <BlackboxResults result={activeResult} />
          </section>

          {activeResult.findings.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest">
                  Likely Issues ({activeResult.findings.length})
                </h2>
                <div className="flex-1 h-px bg-bg-border" />
              </div>
              <div className="space-y-2">
                {activeResult.findings.map((f) => (
                  <DoctorFindingCard key={f.problemId} finding={f} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Upload history */}
      {history.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest">ประวัติการอัปโหลด</h2>
            <div className="flex-1 h-px bg-bg-border" />
          </div>
          <div className="space-y-2">
            {history.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-surface border border-bg-border">
                <span className="text-xs font-mono text-text-muted truncate">{log.fileName}</span>
                <span className="text-[10px] font-mono text-text-faint shrink-0 ml-2">
                  {new Date(log.uploadedAt).toLocaleDateString("th-TH")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function BlackboxClient() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-6 text-sm text-text-muted">Loading…</div>}>
      <BlackboxPageInner />
    </Suspense>
  );
}
