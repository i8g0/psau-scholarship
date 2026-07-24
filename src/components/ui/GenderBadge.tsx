"use client";

interface GenderBadgeProps {
  gender: string;
}

export function GenderBadge({ gender }: GenderBadgeProps) {
  const isMale = gender === "ذكر";
  return (
    <span className={`badge ${isMale ? "badge-male" : "badge-female"}`}>
      {isMale ? "♂" : "♀"} {gender}
    </span>
  );
}