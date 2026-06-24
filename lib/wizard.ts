// lib/wizard.ts — PID, Filter & Rate calculation engine
// All values are deterministic starting points, not magic numbers.
// Every calculation is explained via the `explain` block in WizardResult.
import type { WizardInput, WizardResult } from "@/types";

// ── Frame size buckets ──────────────────────────────────────────────────────
// Tuning characteristics change fundamentally at these thresholds:
// < 110mm  → micro/toothpick: stiff frames, low inertia, high noise
// 111–180  → 3–4 inch: medium mass, needs more I for wind resistance
// 181–250  → 5 inch standard: the dominant size, widest tuning data available
// 251+     → 7 inch+: heavy, low RPM, needs softer D and lower filters
type FrameBucket = "micro" | "mini" | "standard" | "large";

function getBucket(mm: number): FrameBucket {
  if (mm <= 110) return "micro";
  if (mm <= 180) return "mini";
  if (mm <= 250) return "standard";
  return "large";
}

const BASE_PID: Record<FrameBucket, {
  rp: number; ri: number; rd: number; rf: number;
  pp: number; pi: number; pd: number; pf: number;
  yp: number; yi: number; yd: number;
}> = {
  micro:    { rp: 40, ri: 58, rd: 20, rf: 75,  pp: 42, pi: 58, pd: 20, pf: 75,  yp: 28, yi: 80, yd: 0 },
  mini:     { rp: 44, ri: 54, rd: 26, rf: 88,  pp: 46, pi: 54, pd: 26, pf: 88,  yp: 32, yi: 86, yd: 0 },
  standard: { rp: 47, ri: 52, rd: 30, rf: 100, pp: 47, pi: 52, pd: 30, pf: 100, yp: 35, yi: 90, yd: 0 },
  large:    { rp: 36, ri: 46, rd: 20, rf: 85,  pp: 38, pi: 46, pd: 20, pf: 85,  yp: 26, yi: 78, yd: 0 },
};

// ── Filter Hz by bucket ─────────────────────────────────────────────────────
// Smaller frames vibrate at higher frequencies → higher LPF cutoffs needed.
// D-term LPF matters most for propwash/noise — tune conservatively first.
const BASE_FILTERS: Record<FrameBucket, { gyro1: number; gyro2: number; dterm: number }> = {
  micro:    { gyro1: 200, gyro2: 200, dterm: 120 },
  mini:     { gyro1: 200, gyro2: 200, dterm: 110 },
  standard: { gyro1: 200, gyro2: 200, dterm: 100 },
  large:    { gyro1: 150, gyro2: 150, dterm: 80  },
};

export function calculateTuning(input: WizardInput): WizardResult {
  const { frameSize, motorKV, batteryS, propSize, weight, style } = input;
  const bucket = getBucket(frameSize);
  const base = { ...BASE_PID[bucket] };
  const filterBase = { ...BASE_FILTERS[bucket] };

  const r = (v: number) => Math.round(v);

  // ── Style multipliers ─────────────────────────────────────────────────────
  // Race: tighter P for faster error correction, softer D (less noise penalty).
  // Cinematic: reduced P/D for smooth, dampened motion; lower I to avoid I-windup
  //            on slow flowing moves.
  // Freestyle: balanced; the reference point the multipliers scale from.
  const SM = {
    race:      { p: 1.10, i: 1.00, d: 0.88 },
    freestyle: { p: 1.00, i: 1.00, d: 1.00 },
    cinematic: { p: 0.78, i: 0.85, d: 0.80 },
  }[style];

  // ── Weight factor ─────────────────────────────────────────────────────────
  // Heavier → more inertia → needs lower P/D to prevent oscillation.
  // Lighter → quicker motor response → can handle higher P.
  let weightFactor = 1.0;
  let weightNote = "น้ำหนักปกติ ไม่ปรับ";
  if (weight > 550) {
    weightFactor = 0.85;
    weightNote = "น้ำหนักมากมาก → ลด P/D 15% ป้องกัน oscillation";
  } else if (weight > 420) {
    weightFactor = 0.93;
    weightNote = "น้ำหนักสูง → ลด P/D 7%";
  } else if (weight < 150) {
    weightFactor = 1.15;
    weightNote = "น้ำหนักน้อยมาก → เพิ่ม P/D 15% เพิ่ม responsiveness";
  } else if (weight < 220) {
    weightFactor = 1.08;
    weightNote = "น้ำหนักน้อย → เพิ่ม P/D 8%";
  }

  // ── Battery voltage factor ────────────────────────────────────────────────
  // Higher S = more voltage = more power = needs slightly softer D to avoid
  // noise amplification at high RPM.
  const voltageFactor = batteryS >= 6 ? 0.92 : batteryS <= 2 ? 1.05 : 1.0;

  const pid = {
    roll: {
      p: r(base.rp * SM.p * weightFactor),
      i: r(base.ri * SM.i),
      d: r(base.rd * SM.d * weightFactor * voltageFactor),
      f: base.rf,
    },
    pitch: {
      p: r(base.pp * SM.p * weightFactor),
      i: r(base.pi * SM.i),
      d: r(base.pd * SM.d * weightFactor * voltageFactor),
      f: base.pf,
    },
    yaw: {
      p: r(base.yp * SM.p),
      i: r(base.yi * SM.i),
      d: base.yd,
    },
  };

  // ── Filter adjustments ────────────────────────────────────────────────────
  let { gyro1, gyro2, dterm } = filterBase;

  // Cinematic → softer filters for smoother gyro signal at expense of latency
  if (style === "cinematic") {
    dterm = r(dterm * 0.80);
    gyro1 = Math.min(gyro1, 150);
  }
  // High KV + high S → more electrical noise → lower D-term LPF slightly
  if (motorKV > 2600 && batteryS >= 4) {
    dterm = r(dterm * 0.90);
  }
  // Large props generate more low-freq vibration → notch helps more than LPF
  const dynamicNotch: "OFF" | "LOW" | "MEDIUM" | "HIGH" =
    propSize > 60 ? "HIGH" : propSize > 45 ? "MEDIUM" : "LOW";

  const filters = {
    gyroLpf1Hz: gyro1,
    gyroLpf2Hz: gyro2,
    dTermLpf1Hz: dterm,
    rpmFilter: true, // Always recommended with DSHOT protocols
    dynamicNotch,
    dTermLpfType: style === "cinematic" ? "PT1" : "BIQUAD",
  };

  // ── Rates ─────────────────────────────────────────────────────────────────
  // Using Actual rates format (Betaflight 4.2+). Values give ~600–720°/s
  // max for freestyle/race, ~400°/s for cinematic.
  const rates = {
    roll:  style === "race" ? { rc_rate: 1.00, rate: 0.73, expo: 0.00 }
         : style === "cinematic" ? { rc_rate: 0.65, rate: 0.45, expo: 0.25 }
         : { rc_rate: 1.00, rate: 0.70, expo: 0.12 },
    pitch: style === "race" ? { rc_rate: 1.00, rate: 0.73, expo: 0.00 }
         : style === "cinematic" ? { rc_rate: 0.65, rate: 0.45, expo: 0.25 }
         : { rc_rate: 1.00, rate: 0.70, expo: 0.12 },
    yaw:   style === "race" ? { rc_rate: 1.00, rate: 0.50, expo: 0.00 }
         :                    { rc_rate: 0.90, rate: 0.50, expo: 0.10 },
  };

  // ── Confidence & explainability ───────────────────────────────────────────
  // Confidence = how "standard" the inputs are. Unusual combos reduce it.
  let confidence = 95;
  const confidenceNotes: string[] = [];
  if (bucket === "micro" && batteryS >= 4) {
    confidence -= 10;
    confidenceNotes.push("Micro frame + 4S+ ผิดปกติ ค่าอาจต้องปรับมาก");
  }
  if (bucket === "large" && motorKV > 2200) {
    confidence -= 10;
    confidenceNotes.push("7 inch+ ปกติใช้ KV ต่ำกว่า 1800 ค่าอาจไม่ตรง");
  }
  if (weight > 700) {
    confidence -= 8;
    confidenceNotes.push("น้ำหนักเกิน 700g ออกนอกฐานข้อมูลปกติ");
  }

  // ── CLI Commands ──────────────────────────────────────────────────────────
  const cliCommands = [
    `# OBIXCORE AI — ${style.toUpperCase()} ${frameSize}mm ${batteryS}S`,
    `# Generated ${new Date().toLocaleDateString("th-TH")} | Confidence ${confidence}%`,
    `#`,
    `# ── PID ─────────────────────────────────────────`,
    `set p_roll = ${pid.roll.p}`,
    `set i_roll = ${pid.roll.i}`,
    `set d_roll = ${pid.roll.d}`,
    `set f_roll = ${pid.roll.f}`,
    `set p_pitch = ${pid.pitch.p}`,
    `set i_pitch = ${pid.pitch.i}`,
    `set d_pitch = ${pid.pitch.d}`,
    `set f_pitch = ${pid.pitch.f}`,
    `set p_yaw = ${pid.yaw.p}`,
    `set i_yaw = ${pid.yaw.i}`,
    `set d_yaw = ${pid.yaw.d}`,
    `#`,
    `# ── Filters ─────────────────────────────────────`,
    `set gyro_lowpass_hz = ${filters.gyroLpf1Hz}`,
    `set gyro_lowpass2_hz = ${filters.gyroLpf2Hz}`,
    `set dterm_lowpass_hz = ${filters.dTermLpf1Hz}`,
    `set dterm_lowpass_type = ${filters.dTermLpfType}`,
    `set dyn_notch_mode = ${filters.dynamicNotch}`,
    `set rpm_filter_harmonics = 3`,
    `#`,
    `# ── Rates (Actual) ──────────────────────────────`,
    `set rates_type = ACTUAL`,
    `set roll_rc_rate = ${Math.round(rates.roll.rc_rate * 100)}`,
    `set roll_expo = ${Math.round(rates.roll.expo * 100)}`,
    `set roll_srate = ${Math.round(rates.roll.rate * 100)}`,
    `set pitch_rc_rate = ${Math.round(rates.pitch.rc_rate * 100)}`,
    `set pitch_expo = ${Math.round(rates.pitch.expo * 100)}`,
    `set pitch_srate = ${Math.round(rates.pitch.rate * 100)}`,
    `set yaw_rc_rate = ${Math.round(rates.yaw.rc_rate * 100)}`,
    `set yaw_expo = ${Math.round(rates.yaw.expo * 100)}`,
    `set yaw_srate = ${Math.round(rates.yaw.rate * 100)}`,
    `save`,
  ];

  // ── Warnings ──────────────────────────────────────────────────────────────
  const warnings: string[] = [];
  if (motorKV > 2600 && batteryS >= 5) {
    warnings.push("⚠️ KV สูง + แบต 5S/6S — ตรวจ motor temp หลังบิน 1 แพ็ก อาจร้อนเกิน");
  }
  if (weight > 500 && style === "race") {
    warnings.push("⚠️ น้ำหนักเกิน 500g สำหรับ race — thrust-to-weight ต่ำลง ความเร็วลดลง");
  }
  if (propSize > 60 && frameSize < 200) {
    warnings.push("⚠️ Prop ใหญ่เกินสำหรับ frame ขนาดนี้ — อาจกระทบ prop clearance");
  }
  if (motorKV < 1000 && batteryS <= 3) {
    warnings.push("⚠️ KV ต่ำ + แบต 3S — thrust อาจไม่พอ ลอง 4S หรือ motor KV สูงกว่า");
  }
  if (confidenceNotes.length > 0) {
    warnings.push(...confidenceNotes.map(n => `⚠️ ${n}`));
  }

  // ── Tips ──────────────────────────────────────────────────────────────────
  const tips: string[] = [
    "บินใน Angle mode ก่อน 1 แพ็กเพื่อตรวจสอบพฤติกรรมพื้นฐาน",
    "ถ้าโดรนสั่นหลัง throttle drop → ลอง iterm_relax = RP",
  ];
  if (style === "freestyle") {
    tips.push("ถ้าต้องการ stick feel หนักขึ้น → เพิ่ม F term ทีละ 10 จนรู้สึกถึงการตอบสนอง");
    tips.push("Propwash ตอน split-s → เพิ่ม D เล็กน้อยหรือเปิด iterm_relax");
  }
  if (style === "race") {
    tips.push("Race tune เน้น response เร็ว — ถ้า P oscillation ให้ลด P ทีละ 3 จุด");
  }
  if (style === "cinematic") {
    tips.push("ถ้า footage สั่น ให้เพิ่ม D ทีละ 5 จนนิ่ง หรือใช้ Blackbox ดู noise");
  }

  return {
    pid,
    filters,
    rates,
    cliCommands,
    warnings,
    tips,
    confidence,
  };
}

export function calculateFlightTime(
  batteryMah: number,
  _batteryS: number,
  estimatedCurrentA: number
): number {
  const usableCapacity = batteryMah * 0.8;
  if (estimatedCurrentA <= 0) return 0;
  return Math.round((usableCapacity / 1000 / estimatedCurrentA) * 60 * 10) / 10;
}

export function estimateCurrentDraw(
  motorKV: number,
  batteryS: number,
  motorCount: number,
  propSize: number
): number {
  const voltage = batteryS * 3.7;
  const propFactor = (propSize / 10) * 0.8;
  const baseCurrentPerMotor = (motorKV / 2400) * voltage * propFactor * 0.12;
  return Math.round(baseCurrentPerMotor * motorCount * 0.65 * 10) / 10;
}
