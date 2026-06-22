// lib/wizard.ts — PID & Filter calculation logic
import type { WizardInput, WizardResult } from "@/types";

export function calculateTuning(input: WizardInput): WizardResult {
  const { frameSize, motorKV, batteryS, propSize, weight, style } = input;

  // ── Base PID by frame size ──────────────────────────────────
  let base = {
    rp: 46, ri: 52, rd: 30, rf: 100,
    pp: 46, pi: 52, pd: 30, pf: 100,
    yp: 35, yi: 90, yd: 0,
  };

  if (frameSize <= 110) {
    // Micro / Toothpick
    base = { rp: 42, ri: 55, rd: 22, rf: 80, pp: 44, pi: 55, pd: 22, pf: 80, yp: 30, yi: 85, yd: 0 };
  } else if (frameSize <= 180) {
    // 3-4 inch
    base = { rp: 44, ri: 52, rd: 26, rf: 90, pp: 46, pi: 52, pd: 26, pf: 90, yp: 33, yi: 88, yd: 0 };
  } else if (frameSize <= 240) {
    // 5 inch standard
    base = { rp: 46, ri: 52, rd: 30, rf: 100, pp: 46, pi: 52, pd: 30, pf: 100, yp: 35, yi: 90, yd: 0 };
  } else {
    // 7 inch+
    base = { rp: 38, ri: 48, rd: 22, rf: 90, pp: 40, pi: 48, pd: 22, pf: 90, yp: 28, yi: 80, yd: 0 };
  }

  // ── Style adjustments ───────────────────────────────────────
  const styleMultipliers = {
    race: { p: 1.08, i: 1.0, d: 0.92 },
    freestyle: { p: 1.0, i: 1.0, d: 1.0 },
    cinematic: { p: 0.80, i: 0.88, d: 0.80 },
  };
  const sm = styleMultipliers[style];

  // ── Weight factor ───────────────────────────────────────────
  let weightFactor = 1.0;
  if (weight > 500) weightFactor = 0.88;
  else if (weight > 350) weightFactor = 0.95;
  else if (weight < 180) weightFactor = 1.12;
  else if (weight < 250) weightFactor = 1.06;

  // ── Calculate final PIDs ────────────────────────────────────
  const r = (v: number) => Math.round(v);
  const pid = {
    roll: {
      p: r(base.rp * sm.p * weightFactor),
      i: r(base.ri * sm.i),
      d: r(base.rd * sm.d * weightFactor),
      f: base.rf,
    },
    pitch: {
      p: r(base.pp * sm.p * weightFactor),
      i: r(base.pi * sm.i),
      d: r(base.pd * sm.d * weightFactor),
      f: base.pf,
    },
    yaw: {
      p: r(base.yp * sm.p),
      i: r(base.yi * sm.i),
      d: base.yd,
    },
  };

  // ── Filter recommendations ──────────────────────────────────
  let gyroLpf1 = 200, gyroLpf2 = 200, dTermLpf1 = 110;

  if (frameSize <= 110) {
    gyroLpf1 = 200; gyroLpf2 = 200; dTermLpf1 = 120;
  } else if (frameSize <= 180) {
    gyroLpf1 = 200; gyroLpf2 = 200; dTermLpf1 = 115;
  } else if (frameSize <= 240) {
    gyroLpf1 = 200; gyroLpf2 = 200; dTermLpf1 = 100;
  } else {
    gyroLpf1 = 200; gyroLpf2 = 200; dTermLpf1 = 85;
  }

  if (style === "cinematic") dTermLpf1 = Math.round(dTermLpf1 * 0.8);

  const filters = {
    gyroLpf1Hz: gyroLpf1,
    gyroLpf2Hz: gyroLpf2,
    dTermLpf1Hz: dTermLpf1,
    rpmFilter: true, // เปิดไว้เสมอถ้า ESC รองรับ DSHOT
    dynamicNotch: "MEDIUM",
    dTermLpfType: style === "cinematic" ? "PT1" : "BIQUAD",
  };

  // ── Rates (safe starting) ────────────────────────────────────
  const rates = {
    roll: style === "race"
      ? { rc_rate: 1.0, rate: 0.72, expo: 0.0 }
      : style === "cinematic"
      ? { rc_rate: 0.7, rate: 0.5, expo: 0.2 }
      : { rc_rate: 1.0, rate: 0.70, expo: 0.1 },
    pitch: style === "race"
      ? { rc_rate: 1.0, rate: 0.72, expo: 0.0 }
      : style === "cinematic"
      ? { rc_rate: 0.7, rate: 0.5, expo: 0.2 }
      : { rc_rate: 1.0, rate: 0.70, expo: 0.1 },
    yaw: style === "race"
      ? { rc_rate: 1.0, rate: 0.5, expo: 0.0 }
      : { rc_rate: 1.0, rate: 0.5, expo: 0.1 },
  };

  // ── Generate CLI commands ────────────────────────────────────
  const cliCommands = [
    `# OBIXCORE Tuning Wizard — ${style.toUpperCase()} ${frameSize}mm`,
    `# Generated ${new Date().toLocaleDateString("th-TH")}`,
    `#`,
    `# ── PID ─────────────────────────────────────`,
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
    `# ── Filters ─────────────────────────────────`,
    `set gyro_lowpass_hz = ${filters.gyroLpf1Hz}`,
    `set gyro_lowpass2_hz = ${filters.gyroLpf2Hz}`,
    `set dterm_lowpass_hz = ${filters.dTermLpf1Hz}`,
    `set dterm_lowpass_type = ${filters.dTermLpfType}`,
    `set dyn_notch_mode = ${filters.dynamicNotch}`,
    `set rpm_filter_harmonics = 3`,
    `#`,
    `# ── Rates ────────────────────────────────────`,
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

  // ── Warnings ─────────────────────────────────────────────────
  const warnings: string[] = [];
  const tips: string[] = [];

  if (!filters.rpmFilter) {
    warnings.push("เปิด RPM Filter ต้องการ DSHOT600 + Bidirectional DSHOT เปิดใน ESC");
  }
  if (motorKV > 2600 && batteryS >= 5) {
    warnings.push("⚠️ KV สูง + แบต 5S/6S อาจร้อนมาก ตรวจสอบ motor temperature หลังบิน");
  }
  if (weight > 500 && style === "race") {
    warnings.push("⚠️ น้ำหนักเกิน 500g สำหรับ race style ประสิทธิภาพจะลดลง");
  }
  if (propSize > 60 && frameSize < 200) {
    warnings.push("⚠️ Prop ใหญ่เกินไปสำหรับ frame ขนาดนี้");
  }

  tips.push("เริ่มบินใน Angle mode ก่อนเพื่อตรวจสอบพฤติกรรมโดรนพื้นฐาน");
  tips.push("ถ้าโดรนสั่นหลัง throttle drop ลอง iterm_relax = RP");
  if (style === "freestyle") {
    tips.push("ถ้าต้องการ stick feel ที่หนักขึ้น เพิ่ม F term ทีละ 10");
  }

  return { pid, filters, rates, cliCommands, warnings, tips };
}

export function calculateFlightTime(
  batteryMah: number,
  batteryS: number,
  estimatedCurrentA: number
): number {
  // Simple Peukert approximation
  const usableCapacity = batteryMah * 0.8; // 80% usable
  return (usableCapacity / 1000 / estimatedCurrentA) * 60; // minutes
}

export function estimateCurrentDraw(
  motorKV: number,
  batteryS: number,
  motorCount: number,
  propSize: number
): number {
  // Empirical estimate: larger props + higher S = more current
  const voltage = batteryS * 3.7;
  const propFactor = (propSize / 10) * 0.8; // 5" prop = factor 4.0
  const baseCurrentPerMotor = (motorKV / 2400) * voltage * propFactor * 0.12;
  return baseCurrentPerMotor * motorCount * 0.65; // ~65% throttle average
}
