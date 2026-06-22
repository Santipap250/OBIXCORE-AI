"use client";
import { useCallback, useRef, useState } from "react";
import { getParserFor } from "@/lib/blackbox/parser";
import type { BlackboxAnalysisResult, BlackboxLogMeta } from "@/types";

interface BlackboxUploaderProps {
  onComplete: (meta: BlackboxLogMeta, result: BlackboxAnalysisResult) => void;
}

function generateId(): string {
  if (typeof window !== "undefined" && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `log-${Date.now()}`;
}

export default function BlackboxUploader({ onComplete }: BlackboxUploaderProps) {
  const [status, setStatus] = useState<"idle" | "parsing" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      const parser = getParserFor(file);

      if (!parser) {
        setStatus("error");
        setError(
          "ไฟล์นี้ยังไม่รองรับ — ตอนนี้รองรับเฉพาะ Betaflight Blackbox CSV export (.csv). ไฟล์ .bbl แบบ binary จะรองรับใน Phase ถัดไป"
        );
        return;
      }

      setStatus("parsing");
      const id = generateId();

      try {
        const metaPartial = await parser.parseMeta(file);
        const meta: BlackboxLogMeta = {
          id,
          uploadedAt: new Date().toISOString(),
          status: "parsing",
          ...metaPartial,
        };

        const result = await parser.analyze(file, id);
        onComplete({ ...meta, status: "ready" }, result);
        setStatus("idle");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดระหว่างวิเคราะห์ไฟล์");
      }
    },
    [onComplete]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = ""; // allow re-selecting the same file
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="อัปโหลด Blackbox log ไฟล์ CSV"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isDragOver
            ? "border-purple-DEFAULT bg-purple-muted/30"
            : status === "error"
            ? "border-red-DEFAULT/40 bg-red-muted/10"
            : "border-bg-border bg-bg-surface/60 hover:border-purple-DEFAULT/40 hover:bg-purple-muted/10"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="sr-only"
          aria-hidden="true"
        />

        {status === "parsing" ? (
          <>
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-purple-DEFAULT/30 border-t-purple-DEFAULT" />
            <p className="text-sm font-sarabun text-text">กำลังวิเคราะห์ log...</p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-DEFAULT/30 bg-purple-muted/30">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-purple-DEFAULT">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-sm font-sarabun text-text font-medium">ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์</p>
            <p className="mt-1 text-xs font-mono text-text-faint">Betaflight Blackbox Explorer → Export as CSV</p>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs font-sarabun text-red-DEFAULT leading-relaxed">
          {error}
        </p>
      )}
    </div>
  );
}
