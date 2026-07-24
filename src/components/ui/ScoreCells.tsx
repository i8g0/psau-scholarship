"use client";

import { fmt } from "@/types";

interface ScoreCellsProps {
  max: number;
  avg: number;
  min: number;
}

export function ScoreCells({ max, avg, min }: ScoreCellsProps) {
  return (
    <>
      <td className="score-high">{fmt(max)}</td>
      <td className="score-low">{fmt(min)}</td>
      <td className="score-avg">{fmt(avg)}</td>
    </>
  );
}