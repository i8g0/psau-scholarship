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
  activeTab: TabId;
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
  activeTab,
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

  // Determine which filters to show based on active tab
  const showCampusFilter = activeTab === "majors-nationalities" || activeTab === "nationalities-majors" || activeTab === "majors";
  const showMajorFilter = activeTab === "majors-nationalities" || activeTab === "nationalities-majors" || activeTab === "majors";
  const showNationalityFilter = activeTab === "majors-nationalities" || activeTab === "nationalities-majors" || activeTab === "nationalities";
  const showGenderFilter = true; // Always show gender

  // Reset filters that are not visible for current tab
  const getVisibleFilters = () => {
    const filters = [];
    if (showCampusFilter && campusFilter) filters.push({ key: 'campus', label: campusFilter, onClear: () => onCampusFilterChange('') });
    if (showMajorFilter && majorFilter) filters.push({ key: 'major', label: majorFilter, onClear: () => onMajorFilterChange('') });
    if (showNationalityFilter && nationalityFilter) filters.push({ key: 'nationality', label: nationalityFilter, onClear: () => onNationalityFilterChange('') });
    if (showGenderFilter && genderFilter) filters.push({ key: 'gender', label: genderFilter, onClear: () => onGenderFilterChange('') });
    return filters;
  };

  const activeFiltersSummary = getVisibleFilters();

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="بحث في جميع الحقول..."
          className="input-field input-field-search py-3 min-h-[44px] w-full"
          style={{ touchAction: "manipulation" }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-1"
            style={{ color: "var(--text-muted)", touchAction: "manipulation" }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
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
              style={{ background: "var(--color-primary)" }}
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
            style={{ color: "var(--color-danger)", touchAction: "manipulation" }}
          >
            مسح الكل ✕
          </button>
        )}
      </div>

      <div className={`card p-4 ${showFilters ? "block" : "hidden md:block"}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {showCampusFilter && (
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
          )}

          {showMajorFilter && (
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
          )}

          {showNationalityFilter && (
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
          )}

          {showGenderFilter && (
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
                          ? opt.style.activeBg || "var(--color-primary)"
                          : "var(--bg-input)",
                      border: `1px solid ${
                        genderFilter === opt.val
                          ? opt.style.activeBorder || "var(--color-primary)"
                          : "var(--border-default)"
                      }`,
                      color:
                        genderFilter === opt.val
                          ? opt.style.activeColor || "#ffffff"
                          : "var(--text-secondary)",
                      touchAction: "manipulation",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
              const getBadgeStyle = (key: string): React.CSSProperties => {
                switch (key) {
                  case 'campus': return { background: "rgba(0,119,188,0.1)", color: "var(--color-primary)", border: "1px solid rgba(0,119,188,0.2)" };
                  case 'major': return { background: "rgba(0,152,102,0.1)", color: "var(--color-secondary)", border: "1px solid rgba(0,152,102,0.2)" };
                  case 'nationality': return { background: "rgba(0,119,188,0.1)", color: "var(--color-primary)", border: "1px solid rgba(0,119,188,0.2)" };
                  case 'gender': return genderFilter === "ذكر" 
                    ? { background: "var(--male-badge)", color: "var(--male-text)", border: "1px solid var(--male-border)" }
                    : { background: "var(--female-badge)", color: "var(--female-text)", border: "1px solid var(--female-border)" };
                  default: return {};
                }
              };

              return (
                <span
                  key={filter.key}
                  className="badge text-xs"
                  style={getBadgeStyle(filter.key)}
                >
                  {filter.label}
                  <button onClick={filter.onClear} className="mr-1"><X className="w-3 h-3" /></button>
                </span>
              );
            })}
            <button
              onClick={onClearAllFilters}
              className="text-xs font-medium px-2 py-1 rounded-md mr-auto transition-colors"
              style={{ color: "var(--color-danger)", touchAction: "manipulation" }}
            >
              مسح الكل
            </button>
          </div>
        )}
      </div>
    </div>
  );
}