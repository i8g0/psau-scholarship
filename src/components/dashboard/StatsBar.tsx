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
  { icon: Building2, label: "الفروع", value: "campuses", color: "var(--stat-emerald)" },
  { icon: Globe2, label: "الجنسيات", value: "nationalities", color: "var(--stat-cyan)" },
  { icon: BookOpen, label: "التخصصات", value: "majors", color: "var(--stat-gold)" },
];

export default function StatsBar({ total, campuses, nationalities, majors, loading }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 animate-slide-up">
      <div className="card p-4 md:col-span-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>إجمالي السجلات</span>
        </div>
        <div className="text-3xl md:text-4xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
          {loading ? <span className="skeleton inline-block w-16 h-10" /> : total.toLocaleString()}
        </div>
      </div>
      {statsConfig.map(({ icon: Icon, label, value, color }) => {
        const count = { campuses, nationalities, majors }[value];
        return (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold" style={{ color, fontFamily: "var(--font-display)" }}>
              {loading ? <span className="skeleton inline-block w-10 h-7" /> : count}
            </div>
          </div>
        );
      })}
    </div>
  );
}