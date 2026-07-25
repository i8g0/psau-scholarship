"use client";

import React, { useMemo } from "react";
import { Globe2, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Table2Record, SortDir, sortByScore, groupBy, meanOf } from "@/types";
import { GenderBadge, AccentCell, ScoreCells, ScoreCards, EmptyState } from "../../ui";

export default function NationalitiesMajorsTab({ data, sortDir }: { data: Table2Record[]; sortDir: SortDir }) {
  const sortedData = useMemo(() => {
    if (sortDir === "none") return data;
    return sortByScore([...data], (r) => r.avgScore, sortDir);
  }, [data, sortDir]);

  const nationalityEntries = useMemo(() => {
    const natMap = groupBy(data, (r) => r.nationality);
    const entries = [...natMap.entries()].map(([nationality, natRecords]) => {
      const campusMap = groupBy(natRecords, (r) => r.campus);
      const campuses = [...campusMap.entries()].map(([campus, campusRecords]) => {
        const majorMap = groupBy(campusRecords, (r) => r.major);
        const majors = [...majorMap.entries()].map(([major, majorRecords]) => ({
          major,
          genders: sortByScore(
            [...majorRecords],
            (r) => (r.gender === "ذكر" ? 0 : 1),
            "asc"
          ),
          avg: meanOf(majorRecords.map((r) => r.avgScore)),
        }));
        return {
          campus,
          majors: sortByScore(majors, (m) => m.avg, sortDir),
          totalRows: majors.reduce((s, m) => s + m.genders.length, 0),
          avg: meanOf(campusRecords.map((r) => r.avgScore)),
        };
      });
      return {
        nationality,
        campuses: sortByScore(campuses, (c) => c.avg, sortDir),
        totalRows: campuses.reduce((s, c) => s + c.totalRows, 0),
        avg: meanOf(natRecords.map((r) => r.avgScore)),
      };
    });
    return sortByScore(entries, (n) => n.avg, sortDir);
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
              {sortedData.map((record, i) => (
                <tr key={i}>
                  <AccentCell gender={record.gender} />
                  <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                  <td className="font-semibold">
                    <span className="flex items-center gap-2">
                      <Globe2 className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
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
          {sortedData.map((record, i) => (
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
                    <Globe2 className="w-3 h-3 inline" style={{ color: "var(--color-primary)" }} /> {record.nationality}
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
            {nationalityEntries.map(({ nationality, campuses }) =>
              campuses.map(({ campus, majors }, ci) =>
                majors.map(({ major, genders }, mi) =>
                  genders.map((record, gi) => (
                    <tr key={`${nationality}-${campus}-${major}-${gi}`}>
                      <AccentCell gender={record.gender} />
                      {ci === 0 && mi === 0 && gi === 0 && (
                        <td rowSpan={campuses.reduce((s, c) => s + c.totalRows, 0)}
                            className="font-semibold align-top pt-3">
                          <span className="flex items-center gap-2">
                            <Globe2 className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                            {nationality}
                          </span>
                        </td>
                      )}
                      {mi === 0 && gi === 0 && (
                        <td rowSpan={majors.reduce((s, m) => s + m.genders.length, 0)}
                            className="align-top pt-3">
                          <span className="badge badge-campus text-xs">{campus}</span>
                        </td>
                      )}
                      {gi === 0 && (
                        <td rowSpan={genders.length}
                            style={{ color: "var(--text-secondary)" }}
                            className="align-top pt-3">
                          {major}
                        </td>
                      )}
                      <td><GenderBadge gender={record.gender} /></td>
                      <ScoreCells max={record.maxScore} min={record.minScore} avg={record.avgScore} />
                    </tr>
                  ))
                )
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3 animate-tab-content">
        {nationalityEntries.map(({ nationality, campuses }) => (
          <div key={nationality}>
            <h3 className="mobile-group-header text-sm font-bold">
              <span className="mobile-group-header-icon">
                <Globe2 className="w-3.5 h-3.5" />
              </span>
              {nationality}
            </h3>
            {campuses.map(({ campus, majors }) => (
              <div key={`${nationality}-${campus}`} className="mobile-card mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-campus text-xs">{campus}</span>
                </div>
                {majors.map(({ major, genders }) =>
                  genders.map((record, gi) => (
                    <div
                      key={`${major}-${gi}`}
                      className="rounded-xl p-3 mb-2"
                      style={{
                        background: record.gender === "ذكر" ? "var(--male-bg)" : "var(--female-bg)",
                        border: `1px solid ${record.gender === "ذكر" ? "var(--male-border)" : "var(--female-border)"}`,
                      }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            {major}
                          </p>
                        </div>
                        <GenderBadge gender={record.gender} />
                      </div>
                      <ScoreCards max={record.maxScore} min={record.minScore} avg={record.avgScore} />
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
