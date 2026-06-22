interface ValueDisplayProps {
  label: string;
  value: number | string;
  unit?: string;
  color?: "green" | "amber" | "blue" | "cyan" | "purple" | "orange" | "pink" | "red";
  size?: "sm" | "md" | "lg";
}

const colorMap = {
  green:  { text: "text-green-DEFAULT",  bg: "bg-green-muted/55",  border: "border-green-DEFAULT/30" },
  amber:  { text: "text-amber-DEFAULT",  bg: "bg-amber-muted/55",  border: "border-amber-DEFAULT/30" },
  blue:   { text: "text-blue-DEFAULT",   bg: "bg-blue-muted/55",   border: "border-blue-DEFAULT/30" },
  cyan:   { text: "text-cyan-DEFAULT",   bg: "bg-cyan-muted/55",   border: "border-cyan-DEFAULT/30" },
  purple: { text: "text-purple-DEFAULT", bg: "bg-purple-muted/55", border: "border-purple-DEFAULT/30" },
  orange: { text: "text-orange-DEFAULT", bg: "bg-orange-muted/55", border: "border-orange-DEFAULT/30" },
  pink:   { text: "text-pink-DEFAULT",   bg: "bg-pink-muted/55",   border: "border-pink-DEFAULT/30" },
  red:    { text: "text-red-DEFAULT",    bg: "bg-red-muted/55",    border: "border-red-DEFAULT/30" },
};

export default function ValueDisplay({
  label,
  value,
  unit,
  color = "green",
  size = "md",
}: ValueDisplayProps) {
  const c = colorMap[color];
  const textSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  const labelSize = size === "sm" ? "text-[9px]" : "text-[10px]";

  return (
    <div className={`hud-card flex min-w-[72px] flex-col items-center justify-center rounded-2xl border px-3 py-3 ${c.bg} ${c.border}`}>
      <span className={`${labelSize} mb-1 font-mono uppercase tracking-[0.25em] text-text-muted`}>
        {label}
      </span>
      <div className="flex items-baseline gap-0.5">
        <span className={`${textSize} leading-none font-orbitron font-bold ${c.text}`}>
          {value}
        </span>
        {unit && (
          <span className={`text-xs font-mono ${c.text} opacity-70`}>{unit}</span>
        )}
      </div>
    </div>
  );
}
