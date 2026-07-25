"use client";

import React, { useMemo } from "react";
import { Globe2, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Table3Record, SortDir, sortByScore, groupBy, meanOf } from "@/types";
import { GenderBadge, AccentCell, ScoreCells, ScoreCards, EmptyState } from "../../ui";

export default function NationalitiesTab({ data, sortDir }: { data: Table3Record[]; sortDir: SortDir }) {
  const sortedData = useMemo(() => {
    if (sortDir === "none") return data;
    return sortByScore([...data], (r) => r.avgScore, sortDir);
  }, [data, sortDir]);

  const groupedEntries = useMemo(() => {
    const natMap = groupBy(data, (r) => r.nationality);
    const entries = [...natMap.entries()].map(([nationality, records]) => ({
      nationality,
      genders: sortByScore(
        [...records],
        (r) => (r.gender === "ذكر" ? 0 : 1),
        "asc"
      ),
      avg: meanOf(records.map((r) => r.avgScore)),
    }));
    return sortByScore(entries, (e) => e.avg, sortDir);
  }, [data, sortDir]);

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
              {sortedData.map((entry, i) => (
                <tr key={i}>
                  <AccentCell gender={entry.gender} />
                  <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                  <td>
                    <span className="flex items-center gap-2" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      <Globe2 className="w-4 h-4" style={{ color: "var(--text-accent)" }} />
                      {entry.nationality}
                    </span>
                  </td>
                  <td><GenderBadge gender={entry.gender} /></td>
                  <ScoreCells max={entry.maxScore} min={entry.minScore} avg={entry.avgScore} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3 animate-tab-content">
          {sortedData.map((entry, i) => (
            <div
              key={i}
              className="mobile-card mb-2"
              style={{
                borderRight: `3px solid ${entry.gender === "ذكر" ? "var(--male-accent)" : "var(--female-accent)"}`,
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                    #{i + 1}
                  </span>
                  <Globe2 className="w-4 h-4" style={{ color: "var(--text-accent)" }} />
                  {entry.nationality}
                </span>
                <GenderBadge gender={entry.gender} />
              </div>
              <ScoreCards max={entry.maxScore} min={entry.minScore} avg={entry.avgScore} />
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
            {groupedEntries.map(({ nationality, genders }) => (
              genders.map((entry, gi) => (
                <tr key={`${nationality}-${gi}`}>
                  <AccentCell gender={entry.gender} />
                  {gi === 0 && (
                    <td rowSpan={genders.length} className="align-top pt-3">
                      <span className="flex items-center gap-2" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        <Globe2 className="w-4 h-4" style={{ color: "var(--text-accent)" }} />
                        {nationality}
                      </span>
                    </td>
                  )}
                  <td><GenderBadge gender={entry.gender} /></td>
                  <ScoreCells max={entry.maxScore} min={entry.minScore} avg={entry.avgScore} />
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3 animate-tab-content">
        {groupedEntries.map(({ nationality, genders }) => (
          <div key={nationality} className="mobile-card mb-2">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Globe2 className="w-4 h-4" style={{ color: "var(--text-accent)" }} />
              {nationality}
            </p>
            {genders.map((entry, gi) => (
              <div
                key={gi}
                className="mobile-card mb-2 last:mb-0"
                style={{
                  borderRight: `3px solid ${entry.gender === "ذكر" ? "var(--male-accent)" : "var(--female-accent)"}`,
                }}
              >
                <GenderBadge gender={entry.gender} />
                <ScoreCards max={entry.maxScore} min={entry.minScore} avg={entry.avgScore} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
