"use client";

import React, { useMemo } from "react";
import { Globe2, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { AdmissionRecord, SortDir, sortGroups, sortByScore, meanOf, aggregateRecords } from "@/types";
import { GenderBadge, AccentCell, ScoreCells, ScoreCards, EmptyState } from "../../ui";

export default function TabMinimum({ data, sortDir }: { data: AdmissionRecord[]; sortDir: SortDir }) {
  const grouped = useMemo(() => {
    const map = new Map<string, AdmissionRecord[]>();
    data.forEach((r) => {
      const key = `${r.nationality}||${r.gender}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });

    const natMap = new Map<string, { gender: string; agg: { maxScore: number; avgScore: number; minScore: number; count: number } }[]>();
    for (const [key, records] of map.entries()) {
      const [nationality, gender] = key.split("||");
      if (!natMap.has(nationality)) natMap.set(nationality, []);
      natMap.get(nationality)!.push({
        gender,
        agg: aggregateRecords(records),
      });
    }
    return natMap;
  }, [data]);

  const natEntries = useMemo(() => {
    const withOrderedEntries = Array.from(grouped.entries()).map(
      ([nationality, entries]): [string, { gender: string; agg: { maxScore: number; avgScore: number; minScore: number; count: number } }[]] => [
        nationality,
        sortDir === "none"
          ? [...entries].sort((a, b) => (a.gender === "ذكر" ? -1 : b.gender === "ذكر" ? 1 : 0))
          : sortByScore(entries, (e) => e.agg.avgScore, sortDir),
      ]
    );
    return sortGroups(withOrderedEntries, (entries) => meanOf(entries.map((e) => e.agg.avgScore)), sortDir);
  }, [grouped, sortDir]);

  const flatSorted = useMemo(() => {
    const flat: { nationality: string; gender: string; agg: { maxScore: number; avgScore: number; minScore: number; count: number } }[] = [];
    grouped.forEach((entries, nationality) => {
      entries.forEach((e) => flat.push({ nationality, ...e }));
    });
    return sortByScore(flat, (e) => e.agg.avgScore, sortDir);
  }, [grouped, sortDir]);

  if (data.length === 0) return <EmptyState loading={false} />;

  if (sortDir !== "none") {
    return (
      <>
        <div className="hidden md:block table-container animate-tab-content">
          <table>
            <thead>
              <tr>
                <th aria-hidden="true" style={{ padding: 0, width: 4 }} />
                <th>#</th>
                <th>الجنسية</th>
                <th>الجنس</th>
                <th>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> الأعلى
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" /> الأدنى
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5" /> المتوسط
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {flatSorted.map((entry, i) => (
                <tr key={i}>
                  <AccentCell gender={entry.gender} />
                  <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                  <td className="font-semibold">
                    <span className="flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-green-700" />
                      {entry.nationality}
                    </span>
                  </td>
                  <td><GenderBadge gender={entry.gender} /></td>
                  <ScoreCells max={entry.agg.maxScore} min={entry.agg.minScore} avg={entry.agg.avgScore} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3 animate-tab-content">
          {flatSorted.map((entry, i) => (
            <div
              key={i}
              className="rounded-xl p-3 mb-2"
              style={{
                background: entry.gender === "ذكر" ? "var(--male-bg)" : "var(--female-bg)",
                border: `1px solid ${entry.gender === "ذكر" ? "var(--male-border)" : "var(--female-border)"}`,
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                    #{i + 1}
                  </span>
                  🌍 {entry.nationality}
                </span>
                <GenderBadge gender={entry.gender} />
              </div>
              <ScoreCards max={entry.agg.maxScore} min={entry.agg.minScore} avg={entry.agg.avgScore} />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="hidden md:block table-container animate-tab-content">
        <table>
          <thead>
            <tr>
              <th aria-hidden="true" style={{ padding: 0, width: 4 }} />
              <th>الجنسية</th>
              <th>الجنس</th>
              <th>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> الأعلى
                </span>
              </th>
              <th>
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> الأدنى
                </span>
              </th>
              <th>
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5" /> المتوسط
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {natEntries.map(([nationality, entries]) =>
              entries.map((entry, ei) => (
                <tr key={`${nationality}-${ei}`}>
                  <AccentCell gender={entry.gender} />
                  {ei === 0 && (
                    <td rowSpan={entries.length} className="align-top pt-4 font-semibold">
                      <span className="flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-green-700" />
                        {nationality}
                      </span>
                    </td>
                  )}
                  <td><GenderBadge gender={entry.gender} /></td>
                  <ScoreCells max={entry.agg.maxScore} min={entry.agg.minScore} avg={entry.agg.avgScore} />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3 animate-tab-content">
        {natEntries.map(([nationality, entries]) => (
          <div key={nationality} className="mobile-card">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--olive-700)" }}>
              🌍 {nationality}
            </h4>
            <div className="space-y-3">
              {entries.map((entry, ei) => (
                <div
                  key={ei}
                  className="rounded-xl p-3"
                  style={{
                    background: entry.gender === "ذكر" ? "var(--male-bg)" : "var(--female-bg)",
                    border: `1px solid ${entry.gender === "ذكر" ? "var(--male-border)" : "var(--female-border)"}`,
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <GenderBadge gender={entry.gender} />
                  </div>
                  <ScoreCards max={entry.agg.maxScore} min={entry.agg.minScore} avg={entry.agg.avgScore} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}