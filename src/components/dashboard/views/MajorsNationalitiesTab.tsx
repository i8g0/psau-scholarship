"use client";

import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Table1Record, SortDir, sortByScore, groupBy, meanOf } from "@/types";
import { GenderBadge, AccentCell, ScoreCells, ScoreCards, EmptyState } from "../../ui";

export default function MajorsNationalitiesTab({ data, sortDir }: { data: Table1Record[]; sortDir: SortDir }) {
  const sortedData = useMemo(() => {
    if (sortDir === "none") return data;
    return sortByScore([...data], (r) => r.avgScore, sortDir);
  }, [data, sortDir]);

  const campusEntries = useMemo(() => {
    const campusMap = groupBy(data, (r) => r.campus);
    return sortByScore(
      [...campusMap.entries()].map(([campus, campusRecords]) => {
        const majorMap = groupBy(campusRecords, (r) => r.major);
        const majors = sortByScore(
          [...majorMap.entries()].map(([major, majorRecords]) => {
            const natMap = groupBy(majorRecords, (r) => r.nationality);
            const nationalities = sortByScore(
              [...natMap.entries()].map(([nationality, natRecords]) => ({
                nationality,
                genders: sortByScore(
                  [...natRecords],
                  (r) => (r.gender === "ذكر" ? 0 : 1),
                  "asc"
                ),
                avg: meanOf(natRecords.map((r) => r.avgScore)),
              })),
              (n) => n.avg,
              "desc"
            );
            const totalRows = nationalities.reduce((s, n) => s + n.genders.length, 0);
            return { major, nationalities, totalRows, avg: meanOf(majorRecords.map((r) => r.avgScore)) };
          }),
          (m) => m.avg,
          "desc"
        );
        const totalRows = majors.reduce((s, m) => s + m.totalRows, 0);
        return { campus, majors, totalRows, avg: meanOf(campusRecords.map((r) => r.avgScore)) };
      }),
      (c) => c.avg,
      "desc"
    );
  }, [data]);

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
              {sortedData.map((record, i) => (
                <tr key={i}>
                  <AccentCell gender={record.gender} />
                  <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                  <td><span className="badge badge-campus">{record.campus}</span></td>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{record.major}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{record.nationality}</td>
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
                    {record.major}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {record.nationality}
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
              <th>الفرع</th>
              <th>التخصص</th>
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
            {campusEntries.map(({ campus, majors }) =>
              majors.map(({ major, nationalities }, mi) =>
                nationalities.map(({ nationality, genders }, ni) =>
                  genders.map((record, gi) => (
                    <tr key={`${campus}-${major}-${nationality}-${gi}`}>
                      {mi === 0 && ni === 0 && gi === 0 && (
                        <AccentCell gender={record.gender} rowSpan={majors.reduce((s, m) => s + m.totalRows, 0)} />
                      )}
                      {mi === 0 && ni === 0 && gi === 0 && (
                        <td rowSpan={majors.reduce((s, m) => s + m.totalRows, 0)}
                            className="align-top pt-3">
                          <span className="badge badge-campus">{campus}</span>
                        </td>
                      )}
                      {ni === 0 && gi === 0 && (
                        <td rowSpan={nationalities.reduce((s, n) => s + n.genders.length, 0)}
                            style={{ color: "var(--text-primary)", fontWeight: 500 }}
                            className="align-top pt-3">
                          {major}
                        </td>
                      )}
                      {gi === 0 && (
                        <td rowSpan={genders.length}
                            style={{ color: "var(--text-secondary)" }}
                            className="align-top pt-3">
                          {nationality}
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
        {campusEntries.map(({ campus, majors }) => (
          <div key={campus} className="space-y-3">
            <div className="sticky top-0 z-10 py-2" style={{ background: "var(--bg-body)" }}>
              <span className="badge badge-campus text-sm font-bold">{campus}</span>
            </div>
            {majors.map(({ major, nationalities }) => (
              <div key={`${campus}-${major}`} className="space-y-2">
                <p className="text-sm font-bold px-1" style={{ color: "var(--text-primary)" }}>
                  {major}
                </p>
                {nationalities.map(({ nationality, genders }) => (
                  <div key={`${campus}-${major}-${nationality}`} className="mr-3">
                    <p className="text-xs mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>
                      {nationality}
                    </p>
                    {genders.map((record, gi) => (
                      <div
                        key={gi}
                        className="mobile-card mb-2"
                        style={{
                          borderRight: `3px solid ${record.gender === "ذكر" ? "var(--male-accent)" : "var(--female-accent)"}`,
                        }}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <GenderBadge gender={record.gender} />
                        </div>
                        <ScoreCards max={record.maxScore} min={record.minScore} avg={record.avgScore} />
                      </div>
                    ))}
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
