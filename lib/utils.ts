// lib/utils.ts

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const success = document.execCommand("copy");
    document.body.removeChild(el);
    return success;
  }
}

export function formatNumber(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

export const FRAME_SIZE_LABELS: Record<string, string> = {
  "2inch": "2\"",
  "3inch": "3\"",
  "5inch": "5\"",
  "7inch": "7\"+",
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-green-DEFAULT border-green-DEFAULT bg-green-muted",
  intermediate: "text-amber-DEFAULT border-amber-DEFAULT bg-amber-muted",
  advanced: "text-red-DEFAULT border-red-DEFAULT bg-red-muted",
};

export const STYLE_COLORS: Record<string, string> = {
  race: "text-red-DEFAULT border-red-DEFAULT bg-red-muted",
  freestyle: "text-purple-DEFAULT border-purple-DEFAULT bg-purple-muted",
  cinematic: "text-blue-DEFAULT border-blue-DEFAULT bg-blue-muted",
  beginner: "text-green-DEFAULT border-green-DEFAULT bg-green-muted",
};

export const SEVERITY_COLORS: Record<string, string> = {
  low: "text-green-DEFAULT",
  medium: "text-amber-DEFAULT",
  high: "text-red-DEFAULT",
};
