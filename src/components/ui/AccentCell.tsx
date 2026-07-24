"use client";

interface AccentCellProps {
  gender: string;
}

export function AccentCell({ gender }: AccentCellProps) {
  return (
    <td
      className={`accent-cell ${gender === "ذكر" ? "accent-male" : "accent-female"}`}
      aria-hidden="true"
    />
  );
}