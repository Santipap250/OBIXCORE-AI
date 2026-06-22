import { DIFFICULTY_COLORS, STYLE_COLORS } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "difficulty" | "style" | "default" | "outline";
  value?: string;
  className?: string;
}

export default function Badge({ children, variant = "default", value, className = "" }: BadgeProps) {
  let colorClasses = "text-text-muted border-bg-border bg-bg-elevated";

  if (variant === "difficulty" && value) {
    colorClasses = DIFFICULTY_COLORS[value] || colorClasses;
  } else if (variant === "style" && value) {
    colorClasses = STYLE_COLORS[value] || colorClasses;
  } else if (variant === "outline") {
    colorClasses = "text-text-muted border-bg-border bg-bg-surface";
  }

  return (
    <span
      className={`
        hud-chip inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-medium
        uppercase tracking-[0.22em]
        ${colorClasses} ${className}
      `}
    >
      {children}
    </span>
  );
}
