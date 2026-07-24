"use client";

import React, { useMemo } from "react";
import { Globe2, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { AdmissionRecord, SortDir, sortGroups, sortByScore, meanOf } from "@/types";
import { GenderBadge, AccentCell, ScoreCells, ScoreCards, EmptyState } from "../../ui";

export default function TabByNationality({ data, sortDir }: { data: AdmissionRecord[]; sortDir: SortDir }) {
  const grouped = useMemo(() => {
    const natMap = new Map<string, AdmissionRecord[]>();
    data.forEach((r) => {
      if (!natMap.has(r.nationality)) natMap.set(r.nationality, []);
      natMap.get(r.nationality)!.push(r);
    });
    return natMap;
  }, [data]);

  const natEntries = useMemo(
    () => sortGroups(Array.from(grouped.entries()), (records) => meanOf(records.map((r) => r.avgScore)), sortDir),
    [grouped, sortDir]
  );

  const sortedRecordsFor = (records: AdmissionRecord[]) =>
    sortDir === "none"
      ? [...records].sort((a, b) =>
          a.gender === "ذكر" && b.gender !== "ذكر"
            ? -1
            : a.gender !== "ذكر" && b.gender === "ذكر"
            ? 1
            : a.campus.localeCompare(b.campus) || a.major.localeCompare(b.major)
        )
      : sortByScore(records, (r) => r.avgScore, sortDir);

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
                <th>الفرع</th>
                <th>التخصص</th>
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
              {data.map((record, i) => (
                <tr key={i}>
                  <AccentCell gender={record.gender} />
                  <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                  <td className="font-semibold">
                    <span className="flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-green-700" />
                      {record.nationality}
                    </span>
                  </td>
                  <td><span className="badge badge-campus text-xs">{record.campus}</span></td>
                  <td style={{ color: "var(--text-secondary)" }}>{record.major}</td>
                  <td><GenderBadge gender={record.gender} /></td>
                  <ScoreCells max={record.maxScore} min={record.minScore} avg={record.avgScore} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3 animate-tab-content">
          {data.map((record, i) => (
            <div
              key={i}
              className="mobile-card mb-2"
              style={{
                borderRight: `3px solid ${record.gender === "ذكر" ? "var(--male-accent)" : "var(--female-accent)"}`,
              }}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                      #{i + 1}
                    </span>
                    <span className="badge badge-campus text-xs">{record.campus}</span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    🌍 {record.nationality}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {record.major}
                  </p>
                </div>
                <GenderBadge gender={record.gender} />
              </div>
              <ScoreCards max={record.maxScore} min={record.minScore} avg={record.avgScore} />
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
              <th>الفرع</th>
              <th>التخصص</th>
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
            {natEntries.map(([nationality, records]) => {
              const sorted = sortedRecordsFor(records);
              return sorted.map((record, ri) => (
                <tr key={`${nationality}-${ri}`}>
                  <AccentCell gender={record.gender} />
                  {ri === 0 && (
                    <td rowSpan={sorted.length} className="align-top pt-4 font-semibold">
                      <span className="flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-green-700" />
                        {nationality}
                      </span>
                    </td>
                  )}
                  <td>
                    <span className="badge badge-campus text-xs">{record.campus}</span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{record.major}</td>
                  <td><GenderBadge gender={record.gender} /></td>
                  <ScoreCells max={record.maxScore} min={record.minScore} avg={record.avgScore} />
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3 animate-tab-content">
        {natEntries.map(([nationality, records]) => (
          <div key={nationality}>
            <h3 className="mobile-group-header text-sm font-bold">
              <span className="mobile-group-header-icon">
                <Globe2 className="w-3.5 h-3.5" />
              </span>
              {nationality}
            </h3>
            {sortedRecordsFor(records)
              .map((record, ri) => (
                <div
                  key={ri}
                  className="mobile-card mb-2"
                  style={{
                    borderRight: `3px solid ${record.gender === "ذكر" ? "var(--male-accent)" : "var(--female-accent)"}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-campus text-xs">{record.campus}</span>
                        <GenderBadge gender={record.gender} />
                      </div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {record.major}
                      </p>
                    </div>
                  </div>
                  <ScoreCards max={record.maxScore} min={record.minScore} avg={record.avgScore} />
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}