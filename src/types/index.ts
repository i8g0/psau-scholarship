import { Building2, Globe2, Minimize2, EyeOff, GitBranch, Share2, BookOpen, Users } from "lucide-react";

export interface AdmissionRecord {
  campus: string;
  major: string;
  nationality: string;
  gender: string;
  maxScore: number;
  avgScore: number;
  minScore: number;
}

export interface AggregatedRecord {
  maxScore: number;
  avgScore: number;
  minScore: number;
  count: number;
}

export type SortDir = "none" | "desc" | "asc";

export interface FilterOpts {
  search?: string;
  campus?: string;
  major?: string;
  nationality?: string;
  gender?: string;
}

export const TABS = [
  { id: "majors-nationalities", label: "التخصصات ← الجنسيات", icon: GitBranch },
  { id: "nationalities-majors", label: "الجنسيات ← التخصصات", icon: Share2 },
  { id: "nationalities", label: "الجنسيات", icon: Globe2 },
  { id: "majors", label: "التخصصات", icon: BookOpen },
] as const;

export type TabId = (typeof TABS)[number]["id"];

export function sortGroups<T>(
  entries: [string, T][],
  scoreOf: (v: T) => number,
  dir: SortDir
): [string, T][] {
  if (dir === "none") return entries;
  const sorted = [...entries].sort((a, b) => scoreOf(a[1]) - scoreOf(b[1]));
  return dir === "desc" ? sorted.reverse() : sorted;
}

export function sortByScore<T>(
  items: T[],
  scoreOf: (v: T) => number,
  dir: SortDir
): T[] {
  if (dir === "none") return items;
  const sorted = [...items].sort((a, b) => scoreOf(a) - scoreOf(b));
  return dir === "desc" ? sorted.reverse() : sorted;
}

export function meanOf(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function aggregateRecords(records: AdmissionRecord[]): AggregatedRecord {
  if (records.length === 0)
    return { maxScore: 0, avgScore: 0, minScore: 0, count: 0 };
  return {
    maxScore: Math.max(...records.map((r) => r.maxScore)),
    minScore: Math.min(...records.map((r) => r.minScore)),
    avgScore: records.reduce((sum, r) => sum + r.avgScore, 0) / records.length,
    count: records.length,
  };
}

export function fmt(score: number): string {
  return score.toFixed(3);
}

export const fmtScore = fmt;

export function normalizeArabic(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ً-ٰٟ]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .trim();
}

export function matchesFilters(
  r: AdmissionRecord,
  opts: FilterOpts
): boolean {
  if (opts.search) {
    const q = normalizeArabic(opts.search);
    const combined = normalizeArabic(
      `${r.campus} ${r.major} ${r.nationality} ${r.gender}`
    );
    if (!combined.includes(q)) return false;
  }
  if (opts.campus && r.campus !== opts.campus) return false;
  if (opts.major && r.major !== opts.major) return false;
  if (opts.nationality && r.nationality !== opts.nationality) return false;
  if (opts.gender && r.gender !== opts.gender) return false;
  return true;
}

export function countBy(
  data: AdmissionRecord[],
  key: "campus" | "major" | "nationality"
): Record<string, number> {
  const map: Record<string, number> = {};
  data.forEach((r) => {
    map[r[key]] = (map[r[key]] || 0) + 1;
  });
  return map;
}