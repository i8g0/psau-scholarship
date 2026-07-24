"use client";

import { Building2, Globe2, BookOpen } from "lucide-react";

interface StatsBarProps {
  total: number;
  campuses: number;
  nationalities: number;
  majors: number;
  loading: boolean;
}

const statsConfig = [
  { icon: Building2, label: "الفروع", value: "campuses", color: "#7c3aed" },
  { icon: Globe2, label: "الجنسيات", value: "nationalities", color: "#0891b2" },
  { icon: BookOpen, label: "التخصصات", value: "majors", color: "#c2410c" },
];

export default function StatsBar({ total, campuses, nationalities, majors, loading }: StatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-3 animate-slide-up">
      {statsConfig.map(({ icon: Icon, label, value, color }) => {
        const count = { campuses, nationalities, majors }[value];

        return (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color }}>
              {loading ? <span className="skeleton inline-block w-10 h-7" /> : count}
            </div>
          </div>
        );
      })}
    </div>
  );
}