"use client";

interface AccentCellProps {
  gender: string;
  rowSpan?: number;
}

export function AccentCell({ gender, rowSpan }: AccentCellProps) {
  return (
    <td
      className={`accent-cell ${gender === "ذكر" ? "accent-male" : "accent-female"}`}
      aria-hidden="true"
      rowSpan={rowSpan}
    />
  );
}