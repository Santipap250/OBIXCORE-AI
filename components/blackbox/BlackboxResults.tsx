import type { BlackboxAnalysisResult } from "@/types";

const AXIS_COLOR: Record<string, { text: string; bar: string }> = {
  roll: { text: "text-green-DEFAULT", bar: "bg-green-DEFAULT" },
  pitch: { text: "text-cyan-DEFAULT", bar: "bg-cyan-DEFAULT" },
  yaw: { text: "text-amber-DEFAULT", bar: "bg-amber-DEFAULT" },
};

function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 0.7) return { label: "สูง", color: "text-red-DEFAULT" };
  if (score >= 0.4) return { label: "ปานกลาง", color: "text-amber-DEFAULT" };
  return { label: "ต่ำ", color: "text-green-DEFAULT" };
}

export default function BlackboxResults({ result }: { result: BlackboxAnalysisResult }) {
  return (
    <div className="space-y-3">
      {result.axes.map((axis) => {
        const colors = AXIS_COLOR[axis.axis];
        const propwash = scoreLabel(axis.propwashScore);
        return (
          <div key={axis.axis} className="hud-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-orbitron font-semibold uppercase ${colors.text}`}>{axis.axis}</p>
              <span className={`text-[10px] font-mono ${propwash.color}`}>Propwash: {propwash.label}</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-text-muted mb-1">
                  <span>Gyro noise (peak-to-peak)</span>
                  <span>{axis.noisePeakToPeak.toFixed(0)} °/s</span>
                </div>
                <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colors.bar}`}
                    style={{ width: `${Math.min(100, (axis.noisePeakToPeak / 800) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-text-muted mb-1">
                  <span>Propwash score</span>
                  <span>{Math.round(axis.propwashScore * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-DEFAULT to-pink-DEFAULT"
                    style={{ width: `${axis.propwashScore * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
