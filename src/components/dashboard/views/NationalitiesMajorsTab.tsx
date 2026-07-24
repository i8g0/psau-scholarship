"use client";

import React, { useMemo } from "react";
import { Globe2, Building2, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { AdmissionRecord, SortDir, sortGroups, sortByScore, meanOf } from "@/types";
import { GenderBadge, AccentCell, ScoreCells, ScoreCards, EmptyState } from "../../ui";

export default function NationalitiesMajorsTab({ data, sortDir }: { data: AdmissionRecord[]; sortDir: SortDir }) {
  const grouped = useMemo(() => {
    const natMap = new Map<string, Map<string, Map<string, AdmissionRecord[]>>>();
    data.forEach((r) => {
      if (!natMap.has(r.nationality)) natMap.set(r.nationality, new Map());
      const campusMap = natMap.get(r.nationality)!;
      if (!campusMap.has(r.campus)) campusMap.set(r.campus, new Map());
      const majorMap = campusMap.get(r.campus)!;
      if (!majorMap.has(r.major)) majorMap.set(r.major, []);
      majorMap.get(r.major)!.push(r);
    });
    return natMap;
  }, [data]);

  const natEntries = useMemo(
    () =>
      sortGroups(
        Array.from(grouped.entries()) as [string, Map<string, Map<string, AdmissionRecord[]> >][],
        (campusMap) =>
          meanOf(
            Array.from(campusMap.values())
              .flatMap((majorMap) => Array.from(majorMap.values()).flat())
              .map((r) => r.avgScore)
          ),
        sortDir
      ),
    [grouped, sortDir]
  );

  const campusEntriesFor = (campusMap: Map<string, Map<string, AdmissionRecord[]>>) =>
    sortDir === "none"
      ? (Array.from(campusMap.entries()) as [string, Map<string, AdmissionRecord[]>][])
      : sortGroups(
          Array.from(campusMap.entries()) as [string, Map<string, AdmissionRecord[]>][],
          (majorMap) => meanOf(Array.from(majorMap.values()).flat().map((r) => r.avgScore)),
          sortDir
        );

  const majorEntriesFor = (majorMap: Map<string, AdmissionRecord[]>) =>
    sortDir === "none"
      ? (Array.from(majorMap.entries()) as [string, AdmissionRecord[]][])
      : sortGroups(
          Array.from(majorMap.entries()) as [string, AdmissionRecord[]][],
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
            : a.major.localeCompare(b.major)
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
            {natEntries.map(([nationality, campusMap]) => {
              const campusEntries = campusEntriesFor(campusMap);
              const natRowSpan = campusEntries.reduce((sum, [, majorMap]) => {
                const majorEntries = majorEntriesFor(majorMap);
                return sum + majorEntries.reduce((s, [, records]) => s + records.length, 0);
              }, 0);
              return campusEntries.map(([campus, majorMap], campusIdx) => {
                const majorEntries = majorEntriesFor(majorMap);
                const campusRowSpan = majorEntries.reduce((sum, [, records]) => sum + records.length, 0);
                return majorEntries.map(([major, records], majorIdx) => {
                  const sorted = sortedRecordsFor(records);
                  return sorted.map((record, ri) => (
                    <tr key={`${nationality}-${campus}-${major}-${ri}`}>
                      <AccentCell gender={record.gender} />
                      {ri === 0 && campusIdx === 0 && majorIdx === 0 && (
                        <td rowSpan={natRowSpan} className="align-top pt-4 font-semibold">
                          <span className="flex items-center gap-2">
                            <Globe2 className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                            {nationality}
                          </span>
                        </td>
                      )}
                      {ri === 0 && majorIdx === 0 && (
                        <td rowSpan={campusRowSpan} className="align-top pt-4">
                          <span className="badge badge-campus text-xs">{campus}</span>
                        </td>
                      )}
                      {ri === 0 && (
                        <td
                          rowSpan={sorted.length}
                          className="align-top pt-4"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {major}
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
        {natEntries.map(([nationality, campusMap]) => (
          <div key={nationality}>
            <h3 className="mobile-group-header text-sm font-bold">
              <span className="mobile-group-header-icon">
                <Globe2 className="w-3.5 h-3.5" />
              </span>
              {nationality}
            </h3>
            {campusEntriesFor(campusMap).map(([campus, majorMap]) => (
              <div key={campus} className="mobile-card mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-campus text-xs">{campus}</span>
                </div>
                {majorEntriesFor(majorMap).map(([major, records]) => {
                  const sorted = sortedRecordsFor(records);
                  return sorted.map((record, ri) => (
                    <div
                      key={`${major}-${ri}`}
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