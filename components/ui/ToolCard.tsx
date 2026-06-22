import Link from "next/link";

interface ToolCardProps {
  href: string;
  title: string;
  titleTh: string;
  description: string;
  icon: React.ReactNode;
  accentColor?: "green" | "amber" | "blue" | "cyan" | "purple" | "orange" | "pink";
  badge?: string;
}

const accentMap = {
  green:  { border: "border-green-DEFAULT/20",  hover: "hover:border-green-DEFAULT/60 hover:-translate-y-1 hover:bg-green-muted/20",  icon: "bg-green-muted/80 border-green-DEFAULT/40 text-green-DEFAULT",  badge: "bg-green-muted/80 text-green-DEFAULT",  glow: "from-green-DEFAULT/15" },
  amber:  { border: "border-amber-DEFAULT/20",  hover: "hover:border-amber-DEFAULT/60 hover:-translate-y-1 hover:bg-amber-muted/20",  icon: "bg-amber-muted/80 border-amber-DEFAULT/40 text-amber-DEFAULT",  badge: "bg-amber-muted/80 text-amber-DEFAULT",  glow: "from-amber-DEFAULT/15" },
  blue:   { border: "border-blue-DEFAULT/20",   hover: "hover:border-blue-DEFAULT/60 hover:-translate-y-1 hover:bg-blue-muted/20",   icon: "bg-blue-muted/80 border-blue-DEFAULT/40 text-blue-DEFAULT",   badge: "bg-blue-muted/80 text-blue-DEFAULT",   glow: "from-blue-DEFAULT/15" },
  cyan:   { border: "border-cyan-DEFAULT/20",   hover: "hover:border-cyan-DEFAULT/60 hover:-translate-y-1 hover:bg-cyan-muted/20",   icon: "bg-cyan-muted/80 border-cyan-DEFAULT/40 text-cyan-DEFAULT",   badge: "bg-cyan-muted/80 text-cyan-DEFAULT",   glow: "from-cyan-DEFAULT/15" },
  purple: { border: "border-purple-DEFAULT/20", hover: "hover:border-purple-DEFAULT/60 hover:-translate-y-1 hover:bg-purple-muted/20", icon: "bg-purple-muted/80 border-purple-DEFAULT/40 text-purple-DEFAULT", badge: "bg-purple-muted/80 text-purple-DEFAULT", glow: "from-purple-DEFAULT/15" },
  orange: { border: "border-orange-DEFAULT/20", hover: "hover:border-orange-DEFAULT/60 hover:-translate-y-1 hover:bg-orange-muted/20", icon: "bg-orange-muted/80 border-orange-DEFAULT/40 text-orange-DEFAULT", badge: "bg-orange-muted/80 text-orange-DEFAULT", glow: "from-orange-DEFAULT/15" },
  pink:   { border: "border-pink-DEFAULT/20",   hover: "hover:border-pink-DEFAULT/60 hover:-translate-y-1 hover:bg-pink-muted/20",   icon: "bg-pink-muted/80 border-pink-DEFAULT/40 text-pink-DEFAULT",   badge: "bg-pink-muted/80 text-pink-DEFAULT",   glow: "from-pink-DEFAULT/15" },
};

export default function ToolCard({
  href,
  title,
  titleTh,
  description,
  icon,
  accentColor = "green",
  badge,
}: ToolCardProps) {
  const a = accentMap[accentColor];

  return (
    <Link
      href={href}
      className={`
        group relative block rounded-2xl border bg-bg-surface/92 p-5
        shadow-[0_12px_28px_rgba(0,0,0,0.20)]
        transition-all duration-300 active:scale-[0.99]
        ${a.border} ${a.hover}
      `}
    >
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20 ${a.glow}`} />
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start gap-4">
        <div className={`relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${a.icon}`}>
          <div className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_60%)]`} />
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-orbitron text-sm font-semibold tracking-wide text-text transition-colors group-hover:text-inherit">
              {title}
            </h3>
            {badge && (
              <span className={`hud-chip px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.22em] ${a.badge}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1 font-sarabun text-[13px] leading-relaxed text-text-muted">
            {titleTh}
          </p>
          <p className="mt-1.5 font-sarabun text-[13px] leading-relaxed text-text-muted/90">
            {description}
          </p>
        </div>

        <svg
          className="mt-1 h-4 w-4 flex-shrink-0 text-text-faint transition-all group-hover:translate-x-1 group-hover:text-text-muted"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="hud-accent-line flex-1" />
        <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-text-faint">
          OPEN MODULE
        </span>
        <div className="hud-accent-line flex-1" />
      </div>
    </Link>
  );
}
