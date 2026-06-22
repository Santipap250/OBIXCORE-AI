"use client";
import { useState } from "react";
import { copyToClipboard } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export default function CopyButton({
  text,
  label = "Copy",
  size = "md",
  variant = "outline",
  className = "",
}: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    setStatus(success ? "copied" : "error");
    setTimeout(() => setStatus("idle"), 2000);
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  };

  const variantClasses = {
    default: "bg-gradient-to-r from-green-DEFAULT to-cyan-DEFAULT text-bg-DEFAULT font-semibold hover:opacity-90",
    outline: "border border-green-DEFAULT/40 text-green-DEFAULT hover:bg-green-muted/70 hover:border-green-DEFAULT",
    ghost: "text-text-muted hover:text-green-DEFAULT hover:bg-bg-elevated/80",
  };

  const statusConfig = {
    idle: {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      ),
      text: label,
      classes: variantClasses[variant],
    },
    copied: {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
      text: "Copied!",
      classes: "border border-green-DEFAULT bg-green-muted/70 text-green-DEFAULT shadow-[0_0_18px_rgba(0,232,122,0.15)]",
    },
    error: {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
      text: "Failed",
      classes: "border border-red-DEFAULT bg-red-muted/70 text-red-DEFAULT",
    },
  };

  const current = statusConfig[status];

  return (
    <button
      onClick={handleCopy}
      className={`
        hud-chip inline-flex items-center rounded-lg font-mono transition-all select-none
        active:scale-95
        ${sizeClasses[size]}
        ${current.classes}
        ${className}
      `}
    >
      {current.icon}
      <span>{current.text}</span>
    </button>
  );
}
