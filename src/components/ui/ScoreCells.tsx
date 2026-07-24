"use client";

import { fmtScore } from "@/types";

interface ScoreCellsProps {
  max: number;
  avg: number;
  min: number;
}

export function ScoreCells({ max, avg, min }: ScoreCellsProps) {
  return (
    <>
      <td className="score-low">{fmtScore(min)}</td>
      <td className="score-avg">{fmtScore(avg)}</td>
      <td className="score-high">{fmtScore(max)}</td>
    </>
  );
}