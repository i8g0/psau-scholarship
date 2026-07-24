"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown, Filter, BookOpen, Globe2, MapPin } from "lucide-react";
import { normalizeArabic, SortDir, TabId } from "@/types";
import { SearchableSelect, SortToggle } from "@/components/ui";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  campusFilter: string;
  onCampusFilterChange: (value: string) => void;
  majorFilter: string;
  onMajorFilterChange: (value: string) => void;
  nationalityFilter: string;
  onNationalityFilterChange: (value: string) => void;
  genderFilter: string;
  onGenderFilterChange: (value: string) => void;
  sortDir: SortDir;
  onSortDirChange: (value: SortDir) => void;
  showFilters: boolean;
  onShowFiltersChange: (value: boolean) => void;
  activeFiltersCount: number;
  onClearAllFilters: () => void;
  campuses: string[];
  majors: string[];
  nationalities: string[];
  genderCounts: Record<string, number>;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  campusFilter,
  onCampusFilterChange,
  majorFilter,
  onMajorFilterChange,
  nationalityFilter,
  onNationalityFilterChange,
  genderFilter,
  onGenderFilterChange,
  sortDir,
  onSortDirChange,
  showFilters,
  onShowFiltersChange,
  activeFiltersCount,
  onClearAllFilters,
  campuses,
  majors,
  nationalities,
  genderCounts,
}: FilterBarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const genderOptions = [
    { val: "", label: "الكل", style: {} },
    { val: "ذكر", label: "♂ ذكر", style: { activeBg: "var(--male-bg)", activeBorder: "var(--male-border)", activeColor: "var(--male-text)" } },
    { val: "أنثى", label: "♀ أنثى", style: { activeBg: "var(--female-bg)", activeBorder: "var(--female-border)", activeColor: "var(--female-text)" } },
  ];

  interface ActiveFilter {
    key: 'campus' | 'major' | 'nationality' | 'gender';
    label: string;
    onClear: () => void;
  }

  const activeFiltersSummary: ActiveFilter[] = [
    campusFilter && { key: 'campus', label: campusFilter, onClear: () => onCampusFilterChange('') },
    majorFilter && { key: 'major', label: majorFilter, onClear: () => onMajorFilterChange('') },
    nationalityFilter && { key: 'nationality', label: nationalityFilter, onClear: () => onNationalityFilterChange('') },
    genderFilter && { key: 'gender', label: genderFilter, onClear: () => onGenderFilterChange('') },
  ].filter((f): f is ActiveFilter => Boolean(f));

  return (
    <div className="space-y-3">
      <div className="card p-3">
        <div className="relative">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث في جميع الحقول..."
            className="input-field pr-10 pl-10 py-3 min-h-[44px]"
            style={{ touchAction: "manipulation" }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1"
              style={{ color: "var(--text-muted)", touchAction: "manipulation" }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between md:hidden">
        <button
          onClick={() => onShowFiltersChange(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px]"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-default)",
            color: "var(--text-secondary)",
            touchAction: "manipulation",
          }}
        >
          <Filter className="w-4 h-4" />
          الفلاتر
          {activeFiltersCount > 0 && (
            <span
              className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
              style={{ background: "var(--olive-600)" }}
            >
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={onClearAllFilters}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: "var(--score-low)", touchAction: "manipulation" }}
          >
            مسح الكل ✕
          </button>
        )}
      </div>

      <div className={`card p-4 ${showFilters ? "block" : "hidden md:block"}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
              الفرع
            </label>
            <SearchableSelect
              options={campuses}
              value={campusFilter}
              onChange={onCampusFilterChange}
              placeholder="جميع الفروع"
              icon={MapPin}
              counts={genderCounts}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
              التخصص
            </label>
            <SearchableSelect
              options={majors}
              value={majorFilter}
              onChange={onMajorFilterChange}
              placeholder="جميع التخصصات"
              icon={BookOpen}
              counts={genderCounts}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
              الجنسية
            </label>
            <SearchableSelect
              options={nationalities}
              value={nationalityFilter}
              onChange={onNationalityFilterChange}
              placeholder="جميع الجنسيات"
              icon={Globe2}
              counts={genderCounts}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
              الجنس
            </label>
            <div className="flex gap-2">
              {genderOptions.map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => onGenderFilterChange(genderFilter === opt.val ? "" : opt.val)}
                  className="flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all min-h-[44px]"
                  style={{
                    background:
                      genderFilter === opt.val
                        ? opt.style.activeBg || "var(--olive-100)"
                        : "var(--bg-input)",
                    border: `1px solid ${
                      genderFilter === opt.val
                        ? opt.style.activeBorder || "var(--olive-300)"
                        : "var(--border-default)"
                    }`,
                    color:
                      genderFilter === opt.val
                        ? opt.style.activeColor || "var(--olive-800)"
                        : "var(--text-secondary)",
                    touchAction: "manipulation",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
              الترتيب
            </label>
            <SortToggle
              value={sortDir}
              onChange={onSortDirChange}
              label="ترتيب المجموعات حسب الموزونة"
            />
          </div>
        </div>

        {activeFiltersCount > 0 && !isMobile && (
          <div className="hidden md:flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--border-light)" }}>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>فلاتر نشطة:</span>
            {activeFiltersSummary.map((filter) => {
              const getBadgeStyle = (key: string) => {
                switch (key) {
                  case 'campus': return { background: "var(--olive-100)", color: "var(--olive-800)", border: "1px solid var(--olive-200)" };
                  case 'major': return { background: "var(--beige-200)", color: "var(--beige-800)", border: "1px solid var(--beige-400)" };
                  case 'nationality': return { background: "rgba(8,145,178,0.1)", color: "#0891b2", border: "1px solid rgba(8,145,178,0.3)" };
                  case 'gender': return `${genderFilter === "ذكر" ? "badge-male" : "badge-female"}`;
                  default: return {};
                }
              };

              return (
                <span
                  key={filter.key}
                  className="badge text-xs"
                  style={getBadgeStyle(filter.key) as any}
                >
                  {filter.label}
                  <button onClick={filter.onClear} className="mr-1"><X className="w-3 h-3" /></button>
                </span>
              );
            })}
            <button
              onClick={onClearAllFilters}
              className="text-xs font-medium px-2 py-1 rounded-md mr-auto transition-colors"
              style={{ color: "var(--score-low)", touchAction: "manipulation" }}
            >
              مسح الكل
            </button>
          </div>
        )}
      </div>
    </div>
  );
}