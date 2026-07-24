"use client";

import React, { useMemo } from "react";
import { Building2, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { AdmissionRecord, SortDir, sortGroups, sortByScore, meanOf, aggregateRecords } from "@/types";
import { GenderBadge, AccentCell, ScoreCells, ScoreCards, EmptyState } from "../../ui";

export default function MajorsTab({ data, sortDir }: { data: AdmissionRecord[]; sortDir: SortDir }) {
  const grouped = useMemo(() => {
    const map = new Map<string, AdmissionRecord[]>();
    data.forEach((r) => {
      const key = `${r.campus}||${r.major}||${r.gender}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });

    const campusMap = new Map<string, Map<string, { gender: string; agg: { maxScore: number; avgScore: number; minScore: number; count: number } }[]>>();
    for (const [key, records] of map.entries()) {
      const [campus, major, gender] = key.split("||");
      if (!campusMap.has(campus)) campusMap.set(campus, new Map());
      const majorMap = campusMap.get(campus)!;
      if (!majorMap.has(major)) majorMap.set(major, []);
      majorMap.get(major)!.push({
        gender,
        agg: aggregateRecords(records),
      });
    }
    return campusMap;
  }, [data]);

  const campusEntries = useMemo(
    () =>
      sortGroups(
        Array.from(grouped.entries()),
        (majorMap) => meanOf(Array.from(majorMap.values()).flat().map((e) => e.agg.avgScore)),
        sortDir
      ),
    [grouped, sortDir]
  );

  const majorEntriesFor = (majorMap: Map<string, { gender: string; agg: { maxScore: number; avgScore: number; minScore: number; count: number } }[]>) =>
    sortDir === "none"
      ? Array.from(majorMap.entries())
      : sortGroups(Array.from(majorMap.entries()), (entries) => meanOf(entries.map((e) => e.agg.avgScore)), sortDir);

  const entriesFor = (entries: { gender: string; agg: { maxScore: number; avgScore: number; minScore: number; count: number } }[]) =>
    sortDir === "none"
      ? [...entries].sort((a, b) => (a.gender === "ذكر" ? -1 : b.gender === "ذكر" ? 1 : 0))
      : sortByScore(entries, (e) => e.agg.avgScore, sortDir);

  const flatSorted = useMemo(() => {
    const flat: { campus: string; major: string; gender: string; agg: { maxScore: number; avgScore: number; minScore: number; count: number } }[] = [];
    grouped.forEach((majorMap, campus) => {
      majorMap.forEach((entries, major) => {
        entries.forEach((e) => flat.push({ campus, major, ...e }));
      });
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
                <th>الفرع</th>
                <th>التخصص</th>
                <th>الجنس</th>
                <th>
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" /> الأدنى
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5" /> مقياس النزعة
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> الأعلى
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {flatSorted.map((entry, i) => (
                <tr key={i}>
                  <AccentCell gender={entry.gender} />
                  <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                  <td><span className="badge badge-campus">{entry.campus}</span></td>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{entry.major}</td>
                  <td><GenderBadge gender={entry.gender} /></td>
                  <ScoreCells max={entry.agg.maxScore} min={entry.agg.minScore} avg={entry.agg.avgScore} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3 animate-tab-content">
          {flatSorted.map((entry, i) => (
            <div key={i} className="mobile-card mb-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>#{i + 1}</span>
                <span className="badge badge-campus text-xs">{entry.campus}</span>
              </div>
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{entry.major}</p>
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
              <th>الفرع</th>
              <th>التخصص</th>
              <th>الجنس</th>
              <th>
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> الأدنى
                </span>
              </th>
              <th>
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5" /> مقياس النزعة
                </span>
              </th>
              <th>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> الأعلى
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {campusEntries.map(([campus, majorMap]) => {
              const majorEntries = majorEntriesFor(majorMap);
              const campusRowSpan = majorEntries.reduce((sum, [, e]) => sum + e.length, 0);
              return majorEntries.map(([major, rawEntries], majorIdx) => {
                const entries = entriesFor(rawEntries);
                return entries.map((entry, ei) => (
                  <tr key={`${campus}-${major}-${ei}`}>
                    <AccentCell gender={entry.gender} />
                    {majorIdx === 0 && ei === 0 && (
                      <td rowSpan={campusRowSpan} className="align-top pt-4 font-medium">
                        <span className="badge badge-campus">{campus}</span>
                      </td>
                    )}
                    {ei === 0 && (
                      <td
                        rowSpan={entries.length}
                        className="align-top pt-4"
                        style={{ color: "var(--text-primary)", fontWeight: 500 }}
                      >
                        {major}
                      </td>
                    )}
                    <td><GenderBadge gender={entry.gender} /></td>
                    <ScoreCells max={entry.agg.maxScore} min={entry.agg.minScore} avg={entry.agg.avgScore} />
                  </tr>
                ));
              });
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3 animate-tab-content">
        {campusEntries.map(([campus, majorMap]) => (
          <div key={campus}>
            <h3 className="mobile-group-header text-sm font-bold">
              <span className="mobile-group-header-icon">
                <Building2 className="w-3.5 h-3.5" />
              </span>
              {campus}
            </h3>
            {majorEntriesFor(majorMap).map(([major, rawEntries]) => (
              <div key={major} className="mobile-card mb-2">
                <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  {major}
                </p>
                <div className="space-y-3">
                  {entriesFor(rawEntries).map((entry, ei) => (
                    <div
                      key={ei}
                      className="rounded-xl p-3"
                      style={{
                        background: entry.gender === "ذكر" ? "var(--male-bg)" : "var(--female-bg)",
                        border: `1px solid ${entry.gender === "ذكر" ? "var(--male-border)" : "var(--female-border)"}`,
                      }}
                    >
                      <GenderBadge gender={entry.gender} />
                      <ScoreCards max={entry.agg.maxScore} min={entry.agg.minScore} avg={entry.agg.avgScore} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}