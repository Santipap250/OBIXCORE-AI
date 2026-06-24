"use client";
import { useState } from "react";
import { calculateTuning } from "@/lib/wizard";
import type { WizardInput, WizardResult } from "@/types";
import ValueDisplay from "@/components/ValueDisplay";
import CodeBlock from "@/components/CodeBlock";

const DEFAULT_INPUT: WizardInput = {
  frameSize: 220,
  motorKV: 2306,
  batteryS: 4,
  propSize: 51,
  weight: 320,
  style: "freestyle",
};

const STYLE_OPTIONS = [
  { value: "freestyle", label: "Freestyle", labelTh: "บินอิสระ/ท่า", color: "purple" },
  { value: "race",      label: "Race",      labelTh: "แข่ง/เร็ว",    color: "red" },
  { value: "cinematic", label: "Cinematic", labelTh: "ถ่ายวิดีโอ",   color: "blue" },
] as const;

function InputField({
  label, sublabel, value, min, max, step = 1, unit, onChange,
}: {
  label: string; sublabel?: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-mono text-text-muted uppercase tracking-wider">{label}</label>
        {sublabel && <span className="text-[10px] text-text-faint font-sarabun">{sublabel}</span>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-bg-elevated border border-bg-border rounded-lg px-3 py-2.5 text-sm font-mono text-text focus:outline-none focus:border-green-DEFAULT/60 focus:bg-bg-surface transition-colors"
        />
        {unit && <span className="text-xs font-mono text-text-muted w-8 shrink-0">{unit}</span>}
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-2 h-1 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: "#00e87a" }}
      />
    </div>
  );
}

export default function WizardClient() {
  const [input, setInput] = useState<WizardInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<WizardResult | null>(null);
  const [step, setStep] = useState<"form" | "result">("form");

  const set = (key: keyof WizardInput, value: number | string) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const handleCalculate = () => {
    const r = calculateTuning(input);
    setResult(r);
    setStep("result");
    setTimeout(() => {
      document.getElementById("result-top")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-5 bg-green-DEFAULT rounded-full" />
          <h1 className="font-orbitron font-bold text-lg text-text tracking-wide">Tuning Wizard</h1>
        </div>
        <p className="text-sm text-text-muted font-sarabun ml-3.5">
          กรอกสเปกโดรน → ได้ค่า PID / Filter / Rates พร้อม CLI command
        </p>
      </div>

      {step === "form" && (
        <div className="space-y-5 animate-fade-in">
          {/* Style selector */}
          <div>
            <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">สไตล์การบิน</p>
            <div className="grid grid-cols-3 gap-2">
              {STYLE_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => set("style", s.value)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    input.style === s.value
                      ? s.value === "race"
                        ? "border-red-DEFAULT bg-red-muted text-red-DEFAULT"
                        : s.value === "cinematic"
                        ? "border-blue-DEFAULT bg-blue-muted text-blue-DEFAULT"
                        : "border-purple-DEFAULT bg-purple-muted text-purple-DEFAULT"
                      : "border-bg-border bg-bg-surface text-text-muted hover:border-bg-border hover:bg-bg-elevated"
                  }`}
                >
                  <p className="text-sm font-orbitron font-semibold">{s.label}</p>
                  <p className="text-[11px] font-sarabun mt-0.5 opacity-80">{s.labelTh}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-bg-border" />

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Frame Size"
              sublabel="ขนาด frame (มม.)"
              value={input.frameSize}
              min={65} max={360} step={5} unit="mm"
              onChange={(v) => set("frameSize", v)}
            />
            <InputField
              label="Motor KV"
              sublabel="KV rating ของมอเตอร์"
              value={input.motorKV}
              min={1000} max={4000} step={50} unit="KV"
              onChange={(v) => set("motorKV", v)}
            />
            <InputField
              label="Battery"
              sublabel="จำนวน cell"
              value={input.batteryS}
              min={2} max={6} step={1} unit="S"
              onChange={(v) => set("batteryS", v)}
            />
            <InputField
              label="Prop Size"
              sublabel="ขนาด prop (x10)"
              value={input.propSize}
              min={20} max={75} step={1} unit={'×0.1"'}
              onChange={(v) => set("propSize", v)}
            />
          </div>
          <InputField
            label="Weight (AUW)"
            sublabel="น้ำหนักพร้อมแบต (กรัม)"
            value={input.weight}
            min={80} max={900} step={10} unit="g"
            onChange={(v) => set("weight", v)}
          />

          {/* Summary strip */}
          <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-bg-elevated border border-bg-border">
            {[
              { label: "Frame", value: `${input.frameSize}mm` },
              { label: "Motor", value: `${input.motorKV}KV` },
              { label: "Battery", value: `${input.batteryS}S` },
              { label: "Prop", value: `${(input.propSize / 10).toFixed(1)}"` },
              { label: "AUW", value: `${input.weight}g` },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-text-faint uppercase">{s.label}</span>
                <span className="text-xs font-mono text-green-DEFAULT font-semibold">{s.value}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleCalculate}
            className="w-full py-4 rounded-xl bg-green-DEFAULT text-bg-DEFAULT font-orbitron font-bold text-sm tracking-widest hover:bg-green-dim active:scale-99 transition-all glow-green"
          >
            ⚡ คำนวณค่าจูน
          </button>

          <p className="text-center text-[11px] text-text-faint font-sarabun">
            ค่าที่ได้เป็นจุดเริ่มต้น — ควร fine-tune ตามโดรนจริง
          </p>
        </div>
      )}

      {step === "result" && result && (
        <div className="space-y-6 animate-slide-up" id="result-top">
          {/* Back button */}
          <button
            onClick={() => setStep("form")}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            แก้ไขข้อมูล
          </button>

          {/* Config badge */}
          <div className="p-3 rounded-xl bg-bg-elevated border border-bg-border flex flex-wrap gap-3 items-center">
            <span className="text-[10px] font-mono text-text-faint uppercase tracking-wider">สเปก:</span>
            <span className="text-xs font-mono text-green-DEFAULT">{input.frameSize}mm · {input.motorKV}KV · {input.batteryS}S · {(input.propSize/10).toFixed(1)}" · {input.weight}g</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
              input.style === "race" ? "bg-red-muted text-red-DEFAULT"
              : input.style === "cinematic" ? "bg-blue-muted text-blue-DEFAULT"
              : "bg-purple-muted text-purple-DEFAULT"
            }`}>{input.style}</span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${result.confidence >= 85 ? "bg-green-DEFAULT" : result.confidence >= 70 ? "bg-amber-DEFAULT" : "bg-red-DEFAULT"}`} />
              <span className={`text-[10px] font-mono ${result.confidence >= 85 ? "text-green-DEFAULT" : result.confidence >= 70 ? "text-amber-DEFAULT" : "text-red-DEFAULT"}`}>
                Confidence {result.confidence}%
              </span>
            </span>
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="space-y-2">
              {result.warnings.map((w, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-amber-muted border border-amber-DEFAULT/30">
                  <span className="text-amber-DEFAULT text-sm mt-0.5 flex-shrink-0">⚠</span>
                  <p className="text-xs font-sarabun text-amber-DEFAULT leading-relaxed">{w}</p>
                </div>
              ))}
            </div>
          )}

          {/* PID Values */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest">PID Values</h2>
              <div className="flex-1 h-px bg-bg-border" />
            </div>
            <div className="space-y-3">
              {(["roll", "pitch", "yaw"] as const).map((axis) => {
                const pid = result.pid[axis];
                const color = axis === "roll" ? "green" : axis === "pitch" ? "cyan" : "amber";
                return (
                  <div key={axis} className="p-3 rounded-xl bg-bg-surface border border-bg-border">
                    <p className="text-[10px] font-mono text-text-faint uppercase tracking-widest mb-2">{axis}</p>
                    <div className="flex gap-2 flex-wrap">
                      <ValueDisplay label="P" value={pid.p} color={color} size="sm" />
                      <ValueDisplay label="I" value={pid.i} color={color} size="sm" />
                      <ValueDisplay label="D" value={pid.d} color={color} size="sm" />
                      {"f" in pid && <ValueDisplay label="F" value={(pid as any).f} color={color} size="sm" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Filters */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest">Filters</h2>
              <div className="flex-1 h-px bg-bg-border" />
            </div>
            <div className="p-3 rounded-xl bg-bg-surface border border-bg-border">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Gyro LPF1", value: result.filters.gyroLpf1Hz, unit: "Hz", color: "blue" as const },
                  { label: "Gyro LPF2", value: result.filters.gyroLpf2Hz, unit: "Hz", color: "blue" as const },
                  { label: "D-Term LPF", value: result.filters.dTermLpf1Hz, unit: "Hz", color: "cyan" as const },
                  { label: "Dyn Notch", value: result.filters.dynamicNotch, color: "purple" as const },
                ].map((f) => (
                  <ValueDisplay key={f.label} label={f.label} value={f.value} unit={f.unit} color={f.color} size="sm" />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${result.filters.rpmFilter ? "bg-green-DEFAULT" : "bg-red-DEFAULT"}`} />
                <span className="text-xs font-mono text-text-muted">
                  RPM Filter: <span className={result.filters.rpmFilter ? "text-green-DEFAULT" : "text-red-DEFAULT"}>
                    {result.filters.rpmFilter ? "ON (ต้องการ Bidirectional DSHOT)" : "OFF"}
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* Rates */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest">Rates (Actual)</h2>
              <div className="flex-1 h-px bg-bg-border" />
            </div>
            <div className="p-3 rounded-xl bg-bg-surface border border-bg-border space-y-2">
              {(["roll", "pitch", "yaw"] as const).map((axis) => {
                const r = result.rates[axis];
                return (
                  <div key={axis} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-text-faint uppercase w-10">{axis}</span>
                    <div className="flex-1 flex gap-1 flex-wrap">
                      {[
                        { k: "RC Rate", v: r.rc_rate },
                        { k: "Rate", v: r.rate },
                        { k: "Expo", v: r.expo },
                      ].map((item) => (
                        <span key={item.k} className="text-[11px] font-mono bg-bg-elevated border border-bg-border rounded px-2 py-0.5 text-text">
                          <span className="text-text-faint">{item.k}: </span>
                          <span className="text-amber-DEFAULT">{item.v}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CLI Commands */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest">Betaflight CLI</h2>
              <div className="flex-1 h-px bg-bg-border" />
              <span className="text-[10px] text-text-faint font-sarabun">copy ทั้งหมด วางใน CLI</span>
            </div>
            <CodeBlock lines={result.cliCommands} title="betaflight_cli.txt" />
          </section>

          {/* Tips */}
          {result.tips.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest">Tips</h2>
                <div className="flex-1 h-px bg-bg-border" />
              </div>
              <div className="space-y-2">
                {result.tips.map((tip, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-blue-muted border border-blue-DEFAULT/20">
                    <span className="text-blue-DEFAULT text-sm flex-shrink-0">💡</span>
                    <p className="text-xs font-sarabun text-blue-DEFAULT leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recalculate */}
          <button
            onClick={() => setStep("form")}
            className="w-full py-3 rounded-xl border border-green-DEFAULT/30 text-green-DEFAULT font-orbitron text-sm hover:bg-green-muted transition-all active:scale-99"
          >
            คำนวณใหม่
          </button>
        </div>
      )}
    </div>
  );
}
