"use client";

import { fmt } from "@/types";

interface ScoreCardsProps {
  max: number;
  avg: number;
  min: number;
}

export function ScoreCards({ max, avg, min }: ScoreCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 text-center mt-3">
      <div className="rounded-lg p-2" style={{ background: "rgba(5, 150, 105, 0.08)" }}>
        <div className="text-xs mb-0.5" style={{ color: "var(--score-high)" }}>
          الأعلى
        </div>
        <div className="text-sm font-bold" style={{ color: "var(--score-high)" }}>
          {fmt(max)}
        </div>
      </div>
      <div className="rounded-lg p-2" style={{ background: "rgba(220, 38, 38, 0.06)" }}>
        <div className="text-xs mb-0.5" style={{ color: "var(--score-low)" }}>
          الأدنى
        </div>
        <div className="text-sm font-bold" style={{ color: "var(--score-low)" }}>
          {fmt(min)}
        </div>
      </div>
      <div className="rounded-lg p-2" style={{ background: "rgba(90, 143, 60, 0.08)" }}>
        <div className="text-xs mb-0.5" style={{ color: "var(--score-avg)" }}>
          المتوسط
        </div>
        <div className="text-sm font-bold" style={{ color: "var(--score-avg)" }}>
          {fmt(avg)}
        </div>
      </div>
    </div>
  );
}