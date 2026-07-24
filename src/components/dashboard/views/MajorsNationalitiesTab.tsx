"use client";

import React, { useMemo } from "react";
import { Building2, Globe2, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { AdmissionRecord, SortDir, sortGroups, sortByScore, meanOf } from "@/types";
import { GenderBadge, AccentCell, ScoreCells, ScoreCards, EmptyState } from "../../ui";

export default function MajorsNationalitiesTab({ data, sortDir }: { data: AdmissionRecord[]; sortDir: SortDir }) {
  const grouped = useMemo(() => {
    const campusMap = new Map<string, Map<string, Map<string, AdmissionRecord[]>>>();
    data.forEach((r) => {
      if (!campusMap.has(r.campus)) campusMap.set(r.campus, new Map());
      const majorMap = campusMap.get(r.campus)!;
      if (!majorMap.has(r.major)) majorMap.set(r.major, new Map());
      const natMap = majorMap.get(r.major)!;
      if (!natMap.has(r.nationality)) natMap.set(r.nationality, []);
      natMap.get(r.nationality)!.push(r);
    });
    return campusMap;
  }, [data]);

  const campusEntries = useMemo(
    () =>
      sortGroups(
        Array.from(grouped.entries()) as [string, Map<string, Map<string, AdmissionRecord[]> >][],
        (majorMap) => meanOf(Array.from(majorMap.values()).flatMap((natMap) => Array.from(natMap.values())).flat().map((r) => r.avgScore)),
        sortDir
      ),
    [grouped, sortDir]
  );

  const majorEntriesFor = (majorMap: Map<string, Map<string, AdmissionRecord[]>>) =>
    sortDir === "none"
      ? (Array.from(majorMap.entries()) as [string, Map<string, AdmissionRecord[]>][])
      : sortGroups(
          Array.from(majorMap.entries()) as [string, Map<string, AdmissionRecord[]>][],
          (natMap) => meanOf(Array.from(natMap.values()).flat().map((r) => r.avgScore)),
          sortDir
        );

  const natEntriesFor = (natMap: Map<string, AdmissionRecord[]>) =>
    sortDir === "none"
      ? (Array.from(natMap.entries()) as [string, AdmissionRecord[]][])
      : sortGroups(
          Array.from(natMap.entries()) as [string, AdmissionRecord[]][],
          (records) => meanOf(records.map((r) => r.avgScore)),
          sortDir
        );

  const sortedRecordsFor = (records: AdmissionRecord[]) =>
    sortDir === "none"
      ? [...records].sort((a, b) =>
          a.gender === "ذكر" && b.gender !== "ذكر"
            ? -1
            : a.gender !== "ذكر" && b.gender === "ذكر"
            ? 1
            : a.nationality.localeCompare(b.nationality)
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
              {data.map((record, i) => (
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
            {campusEntries.map(([campus, majorMap]) => {
              const majorEntries = majorEntriesFor(majorMap);
              const campusRowSpan = majorEntries.reduce((sum, [, natMap]) => 
                sum + Array.from(natMap.values()).reduce((s, r) => s + r.length, 0), 0);
              return majorEntries.map(([major, natMap], majorIdx) => {
                const natEntries = natEntriesFor(natMap);
                const majorRowSpan = natEntries.reduce((sum, [, records]) => sum + records.length, 0);
                return natEntries.map(([nationality, records], natIdx) => {
                  const sorted = sortedRecordsFor(records);
                  return sorted.map((record, ri) => (
                    <tr key={`${campus}-${major}-${nationality}-${ri}`}>
                      <AccentCell gender={record.gender} />
                      {majorIdx === 0 && natIdx === 0 && ri === 0 && (
                        <td rowSpan={campusRowSpan} className="align-top pt-4 font-medium">
                          <span className="badge badge-campus">{campus}</span>
                        </td>
                      )}
                      {natIdx === 0 && ri === 0 && (
                        <td
                          rowSpan={majorRowSpan}
                          className="align-top pt-4"
                          style={{ color: "var(--text-primary)", fontWeight: 500 }}
                        >
                          {major}
                        </td>
                      )}
                      {ri === 0 && (
                        <td
                          rowSpan={sorted.length}
                          className="align-top pt-4"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {nationality}
                        </td>
                      )}
                      <td><GenderBadge gender={record.gender} /></td>
                      <ScoreCells max={record.maxScore} min={record.minScore} avg={record.avgScore} />
                    </tr>
                  ));
                });
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
            {majorEntriesFor(majorMap).map(([major, natMap]) => (
              <div key={major} className="mobile-card mb-2">
                <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  {major}
                </p>
                {natEntriesFor(natMap).map(([nationality, records]) => {
                  const sorted = sortedRecordsFor(records);
                  return sorted.map((record, ri) => (
                    <div
                      key={`${nationality}-${ri}`}
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
                  ));
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}