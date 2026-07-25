"use client";

import React, { useMemo } from "react";
import { Building2, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Table4Record, SortDir, sortByScore, groupBy, meanOf } from "@/types";
import { GenderBadge, AccentCell, ScoreCells, ScoreCards, EmptyState } from "../../ui";

export default function MajorsTab({ data, sortDir }: { data: Table4Record[]; sortDir: SortDir }) {
  const sortedData = useMemo(() => {
    if (sortDir === "none") return data;
    return sortByScore([...data], (r) => r.avgScore, sortDir);
  }, [data, sortDir]);

  const campusEntries = useMemo(() => {
    const campusMap = groupBy(data, (r) => r.campus);
    const entries = [...campusMap.entries()].map(([campus, records]) => {
      const majorMap = groupBy(records, (r) => r.major);
      const majors = [...majorMap.entries()].map(([major, mRecords]) => ({
        major,
        genders: sortByScore(
          [...mRecords],
          (r) => (r.gender === "ذكر" ? 0 : 1),
          "asc"
        ),
        avg: meanOf(mRecords.map((r) => r.avgScore)),
      }));
      return {
        campus,
        majors: sortByScore(majors, (m) => m.avg, sortDir),
        totalRows: majors.reduce((sum, m) => sum + m.genders.length, 0),
        avg: meanOf(records.map((r) => r.avgScore)),
      };
    });
    return sortByScore(entries, (c) => c.avg, sortDir);
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
              {sortedData.map((entry, i) => (
                <tr key={i}>
                  <AccentCell gender={entry.gender} />
                  <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                  <td><span className="badge badge-campus">{entry.campus}</span></td>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{entry.major}</td>
                  <td><GenderBadge gender={entry.gender} /></td>
                  <ScoreCells max={entry.maxScore} min={entry.minScore} avg={entry.avgScore} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3 animate-tab-content">
          {sortedData.map((entry, i) => (
            <div key={i} className="mobile-card mb-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>#{i + 1}</span>
                <span className="badge badge-campus text-xs">{entry.campus}</span>
              </div>
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{entry.major}</p>
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
            {campusEntries.map(({ campus, majors }) =>
              majors.map(({ major, genders }, mi) =>
                genders.map((entry, gi) => (
                  <tr key={`${campus}-${major}-${gi}`}>
                    <AccentCell gender={entry.gender} />
                    {mi === 0 && gi === 0 && (
                      <td rowSpan={majors.reduce((s, m) => s + m.genders.length, 0)}
                          className="align-top pt-3">
                        <span className="badge badge-campus">{campus}</span>
                      </td>
                    )}
                    {gi === 0 && (
                      <td rowSpan={genders.length}
                          style={{ color: "var(--text-primary)", fontWeight: 500 }}
                          className="align-top pt-3">
                        {major}
                      </td>
                    )}
                    <td><GenderBadge gender={entry.gender} /></td>
                    <ScoreCells max={entry.maxScore} min={entry.minScore} avg={entry.avgScore} />
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3 animate-tab-content">
        {campusEntries.map(({ campus, majors }) => (
          <div key={campus}>
            <h3 className="mobile-group-header text-sm font-bold">
              <span className="mobile-group-header-icon">
                <Building2 className="w-3.5 h-3.5" />
              </span>
              {campus}
            </h3>
            {majors.map(({ major, genders }) => (
              <div key={`${campus}-${major}`} className="mobile-card mb-2">
                <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  {major}
                </p>
                {genders.map((entry, gi) => (
                  <div key={gi}
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
        ))}
      </div>
    </>
  );
}
