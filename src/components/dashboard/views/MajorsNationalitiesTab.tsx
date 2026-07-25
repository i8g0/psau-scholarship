"use client";

import React, { useMemo } from "react";
import { Building2, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Table1Record, SortDir, sortByScore, groupBy, meanOf } from "@/types";
import { GenderBadge, AccentCell, ScoreCells, ScoreCards, EmptyState } from "../../ui";

export default function MajorsNationalitiesTab({ data, sortDir }: { data: Table1Record[]; sortDir: SortDir }) {
  const sortedData = useMemo(() => {
    if (sortDir === "none") return data;
    return sortByScore([...data], (r) => r.avgScore, sortDir);
  }, [data, sortDir]);

  const campusEntries = useMemo(() => {
    const campusMap = groupBy(data, (r) => r.campus);
    const entries = [...campusMap.entries()].map(([campus, campusRecords]) => {
      const majorMap = groupBy(campusRecords, (r) => r.major);
      const majors = [...majorMap.entries()].map(([major, majorRecords]) => {
        const natMap = groupBy(majorRecords, (r) => r.nationality);
        const nationalities = [...natMap.entries()].map(([nationality, natRecords]) => ({
          nationality,
          genders: sortByScore(
            [...natRecords],
            (r) => (r.gender === "ذكر" ? 0 : 1),
            "asc"
          ),
          avg: meanOf(natRecords.map((r) => r.avgScore)),
        }));
        return {
          major,
          nationalities: sortByScore(nationalities, (n) => n.avg, sortDir),
          totalRows: nationalities.reduce((s, n) => s + n.genders.length, 0),
          avg: meanOf(majorRecords.map((r) => r.avgScore)),
        };
      });
      return {
        campus,
        majors: sortByScore(majors, (m) => m.avg, sortDir),
        totalRows: majors.reduce((s, m) => s + m.totalRows, 0),
        avg: meanOf(campusRecords.map((r) => r.avgScore)),
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
                      <AccentCell gender={record.gender} />
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
          <div key={campus}>
            <h3 className="mobile-group-header text-sm font-bold">
              <span className="mobile-group-header-icon">
                <Building2 className="w-3.5 h-3.5" />
              </span>
              {campus}
            </h3>
            {majors.map(({ major, nationalities }) => (
              <div key={`${campus}-${major}`} className="mobile-card mb-2">
                <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  {major}
                </p>
                {nationalities.map(({ nationality, genders }) =>
                  genders.map((record, gi) => (
                    <div
                      key={`${nationality}-${gi}`}
                      className="mobile-card mb-2"
                      style={{
                        borderRight: `3px solid ${record.gender === "ذكر" ? "var(--male-accent)" : "var(--female-accent)"}`,
                      }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            {nationality}
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
