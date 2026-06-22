"use client";
import { useState } from "react";
import type { DroneProfileDraft, WizardInput } from "@/types";

const STYLE_OPTIONS = [
  { value: "freestyle", label: "Freestyle", labelTh: "บินอิสระ/ท่า" },
  { value: "race", label: "Race", labelTh: "แข่ง/เร็ว" },
  { value: "cinematic", label: "Cinematic", labelTh: "ถ่ายวิดีโอ" },
] as const;

interface NumberFieldProps {
  id: string;
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}

// Every input is paired with a real <label htmlFor> (not just visual
// proximity) so screen readers announce the field name when it receives
// focus. The original Wizard/Calculator inputs used a <label> that wasn't
// programmatically associated via htmlFor/id — this component fixes that
// pattern for the new Profile form.
function NumberField({ id, label, sublabel, value, min, max, step = 1, unit, onChange }: NumberFieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label htmlFor={id} className="text-xs font-mono text-text-muted uppercase tracking-wider">
          {label}
        </label>
        {sublabel && <span className="text-[10px] text-text-faint font-sarabun">{sublabel}</span>}
      </div>
      <div className="flex items-center gap-2">
        <input
          id={id}
          name={id}
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-bg-elevated border border-bg-border rounded-lg px-3 py-2.5 text-sm font-mono text-text focus:outline-none focus:border-cyan-DEFAULT/60 focus:bg-bg-surface transition-colors"
        />
        {unit && <span className="text-xs font-mono text-text-muted w-10 shrink-0">{unit}</span>}
      </div>
    </div>
  );
}

interface ProfileFormProps {
  initial?: DroneProfileDraft;
  submitLabel: string;
  onSubmit: (draft: DroneProfileDraft) => void;
  onCancel?: () => void;
}

const DEFAULT_SPEC: WizardInput = {
  frameSize: 220,
  motorKV: 2306,
  batteryS: 4,
  propSize: 51,
  weight: 320,
  style: "freestyle",
};

export default function ProfileForm({ initial, submitLabel, onSubmit, onCancel }: ProfileFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [tagsText, setTagsText] = useState(initial?.tags.join(", ") ?? "");
  const [spec, setSpec] = useState<WizardInput>(initial?.spec ?? DEFAULT_SPEC);
  const [nameError, setNameError] = useState<string | null>(null);

  const setSpecField = (key: keyof WizardInput, value: number | string) =>
    setSpec((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("กรุณาตั้งชื่อโดรน");
      document.getElementById("profile-name")?.focus();
      return;
    }
    setNameError(null);

    const draft: DroneProfileDraft = {
      name: trimmedName,
      notes: notes.trim() || undefined,
      spec,
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      basedOnPresetId: initial?.basedOnPresetId,
      lastTuning: initial?.lastTuning,
      isActive: initial?.isActive,
    };
    onSubmit(draft);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="profile-name" className="text-xs font-mono text-text-muted uppercase tracking-wider mb-1.5 block">
          ชื่อโดรน
        </label>
        <input
          id="profile-name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="เช่น Race Quad #1"
          aria-invalid={nameError ? "true" : "false"}
          aria-describedby={nameError ? "profile-name-error" : undefined}
          className={`w-full bg-bg-elevated border rounded-lg px-3 py-2.5 text-sm font-sarabun text-text focus:outline-none transition-colors ${
            nameError ? "border-red-DEFAULT focus:border-red-DEFAULT" : "border-bg-border focus:border-cyan-DEFAULT/60"
          }`}
        />
        {nameError && (
          <p id="profile-name-error" role="alert" className="mt-1.5 text-xs text-red-DEFAULT font-sarabun">
            {nameError}
          </p>
        )}
      </div>

      <div>
        <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">สไตล์การบิน</p>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="สไตล์การบิน">
          {STYLE_OPTIONS.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={spec.style === s.value}
              onClick={() => setSpecField("style", s.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                spec.style === s.value
                  ? "border-cyan-DEFAULT bg-cyan-muted text-cyan-DEFAULT"
                  : "border-bg-border bg-bg-surface text-text-muted hover:bg-bg-elevated"
              }`}
            >
              <p className="text-sm font-orbitron font-semibold">{s.label}</p>
              <p className="text-[11px] font-sarabun mt-0.5 opacity-80">{s.labelTh}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-bg-border" />

      <div className="grid grid-cols-2 gap-4">
        <NumberField id="frameSize" label="Frame Size" sublabel="มม." value={spec.frameSize} min={65} max={360} step={5} unit="mm" onChange={(v) => setSpecField("frameSize", v)} />
        <NumberField id="motorKV" label="Motor KV" sublabel="KV rating" value={spec.motorKV} min={1000} max={4000} step={50} unit="KV" onChange={(v) => setSpecField("motorKV", v)} />
        <NumberField id="batteryS" label="Battery" sublabel="จำนวน cell" value={spec.batteryS} min={2} max={6} step={1} unit="S" onChange={(v) => setSpecField("batteryS", v)} />
        <NumberField id="propSize" label="Prop Size" sublabel="x10" value={spec.propSize} min={20} max={75} step={1} unit='×0.1"' onChange={(v) => setSpecField("propSize", v)} />
      </div>
      <NumberField id="weight" label="Weight (AUW)" sublabel="น้ำหนักพร้อมแบต" value={spec.weight} min={80} max={900} step={10} unit="g" onChange={(v) => setSpecField("weight", v)} />

      <div>
        <label htmlFor="profile-tags" className="text-xs font-mono text-text-muted uppercase tracking-wider mb-1.5 block">
          Tags <span className="normal-case text-text-faint">(คั่นด้วยจุลภาค)</span>
        </label>
        <input
          id="profile-tags"
          name="tags"
          type="text"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="6S, long-range, daily-flyer"
          className="w-full bg-bg-elevated border border-bg-border rounded-lg px-3 py-2.5 text-sm font-mono text-text focus:outline-none focus:border-cyan-DEFAULT/60 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="profile-notes" className="text-xs font-mono text-text-muted uppercase tracking-wider mb-1.5 block">
          Notes
        </label>
        <textarea
          id="profile-notes"
          name="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="บันทึกอะไรก็ได้เกี่ยวกับโดรนลำนี้..."
          className="w-full bg-bg-elevated border border-bg-border rounded-lg px-3 py-2.5 text-sm font-sarabun text-text focus:outline-none focus:border-cyan-DEFAULT/60 transition-colors resize-none"
        />
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-bg-border text-text-muted font-orbitron text-sm hover:bg-bg-elevated transition-all active:scale-[0.99]"
          >
            ยกเลิก
          </button>
        )}
        <button
          type="submit"
          className="flex-[2] py-3 rounded-xl bg-cyan-DEFAULT text-bg-DEFAULT font-orbitron font-bold text-sm tracking-widest hover:bg-cyan-dim active:scale-[0.99] transition-all"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
