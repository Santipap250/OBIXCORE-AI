import Link from "next/link";
import type { DroneProfile } from "@/types";

interface ProfileCardProps {
  profile: DroneProfile;
  onSetActive: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProfileCard({ profile, onSetActive, onDelete }: ProfileCardProps) {
  return (
    <div
      className={`hud-card relative overflow-hidden rounded-2xl p-4 transition-all ${
        profile.isActive ? "border-cyan-DEFAULT/60" : ""
      }`}
    >
      {profile.isActive && <div className="absolute inset-x-0 top-0 h-0.5 bg-cyan-DEFAULT" />}

      <div className="flex items-start justify-between gap-3">
        <Link href={`/profiles/${profile.id}`} className="min-w-0 flex-1 group">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-orbitron text-sm font-semibold text-text group-hover:text-cyan-DEFAULT transition-colors truncate">
              {profile.name}
            </h3>
            {profile.isActive && (
              <span className="hud-chip px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-DEFAULT bg-cyan-muted/60">
                Active
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs font-mono text-text-muted">
            {profile.spec.frameSize}mm · {profile.spec.motorKV}KV · {profile.spec.batteryS}S ·{" "}
            {(profile.spec.propSize / 10).toFixed(1)}&quot; · {profile.spec.weight}g
          </p>
          {profile.notes && (
            <p className="mt-1.5 text-xs font-sarabun text-text-muted/80 line-clamp-2">{profile.notes}</p>
          )}
        </Link>
      </div>

      {profile.tags.length > 0 && (
        <div className="mt-3 flex gap-1.5 flex-wrap">
          {profile.tags.map((tag) => (
            <span key={tag} className="hud-chip px-2 py-0.5 text-[10px] font-mono text-text-muted">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        {!profile.isActive && (
          <button
            onClick={() => onSetActive(profile.id)}
            className="flex-1 py-2 rounded-lg border border-cyan-DEFAULT/30 text-cyan-DEFAULT text-xs font-mono hover:bg-cyan-muted/40 transition-all active:scale-[0.98]"
          >
            ตั้งเป็น Active
          </button>
        )}
        <Link
          href={`/profiles/${profile.id}`}
          className={`${profile.isActive ? "flex-1" : ""} py-2 rounded-lg border border-bg-border text-text-muted text-xs font-mono text-center hover:bg-bg-elevated transition-all`}
        >
          แก้ไข
        </Link>
        <button
          onClick={() => onDelete(profile.id)}
          aria-label={`ลบโปรไฟล์ ${profile.name}`}
          className="p-2 rounded-lg border border-bg-border text-text-faint hover:border-red-DEFAULT/40 hover:text-red-DEFAULT transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
