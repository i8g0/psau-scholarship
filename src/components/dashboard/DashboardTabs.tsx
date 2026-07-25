"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import { useAdmissions } from "@/hooks/useAdmissions";
import { TABS, SortDir, TabId, Table1Record, Table2Record, Table3Record, Table4Record, matchesFilters } from "@/types";
import { EmptyState } from "@/components/ui";
import MajorsNationalitiesTab from "@/components/dashboard/views/MajorsNationalitiesTab";
import NationalitiesMajorsTab from "@/components/dashboard/views/NationalitiesMajorsTab";
import NationalitiesTab from "@/components/dashboard/views/NationalitiesTab";
import MajorsTab from "@/components/dashboard/views/MajorsTab";
import StatsBar from "@/components/dashboard/StatsBar";
import FilterBar from "@/components/dashboard/FilterBar";
import DisclaimerModal from "@/components/dashboard/DisclaimerModal";
import Header from "@/components/dashboard/Header";
import Footer from "@/components/dashboard/Footer";
import MarqueeBar from "@/components/dashboard/MarqueeBar";

export default function DashboardTabs() {
  const { tables, loading, refreshing, fetchData, timeAgo } = useAdmissions();

  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("majors-nationalities");
  const [sortDir, setSortDir] = useState<SortDir>("none");
  const [searchQuery, setSearchQuery] = useState("");
  const [campusFilter, setCampusFilter] = useState("");
  const [majorFilter, setMajorFilter] = useState("");
  const [nationalityFilter, setNationalityFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const dismissDisclaimer = useCallback(() => {
    setShowDisclaimer(false);
    localStorage.setItem("psau-disclaimer-seen-v2", "true");
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("psau-dark-mode", String(next));
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setCampusFilter("");
    setMajorFilter("");
    setNationalityFilter("");
    setGenderFilter("");
    setSearchQuery("");
  }, []);

  // Get the active table data based on current tab
  const activeTableData = useMemo(() => {
    if (!tables) return [];
    switch (activeTab) {
      case "majors-nationalities":
        return tables.table1 as Table1Record[];
      case "nationalities-majors":
        return tables.table2 as Table2Record[];
      case "nationalities":
        return tables.table3 as Table3Record[];
      case "majors":
        return tables.table4 as Table4Record[];
      default:
        return [];
    }
  }, [tables, activeTab]);

  // Extract filter options from the active table
  const campuses = useMemo(() => {
    if (!tables) return [];
    const data = activeTab === "nationalities" ? tables.table4 : (activeTab === "majors" ? tables.table4 : tables.table1);
    return [...new Set(data.map((r) => r.campus).filter(Boolean))].sort();
  }, [tables, activeTab]);

  const majors = useMemo(() => {
    if (!tables) return [];
    let data: { major: string }[] = [];
    if (activeTab === "nationalities") {
      data = tables.table3 as unknown as { major: string }[];
    } else if (activeTab === "nationalities-majors") {
      data = tables.table2;
    } else if (activeTab === "majors") {
      data = tables.table4;
    } else {
      data = tables.table1;
    }
    return [...new Set(data.map((r) => r.major).filter(Boolean))].sort();
  }, [tables, activeTab]);

  const nationalities = useMemo(() => {
    if (!tables) return [];
    let data: { nationality: string }[] = [];
    if (activeTab === "majors") {
      data = tables.table4 as unknown as { nationality: string }[];
    } else if (activeTab === "majors-nationalities") {
      data = tables.table1;
    } else if (activeTab === "nationalities-majors") {
      data = tables.table2;
    } else {
      data = tables.table3;
    }
    return [...new Set(data.map((r) => r.nationality).filter(Boolean))].sort();
  }, [tables, activeTab]);

  const genderCounts = useMemo(() => ({
    "ذكر": activeTableData.filter((r) => r.gender === "ذكر").length,
    "أنثى": activeTableData.filter((r) => r.gender === "أنثى").length,
  }), [activeTableData]);

  const filteredData = useMemo(() =>
    activeTableData.filter((r) =>
      matchesFilters(r, {
        search: searchQuery,
        campus: campusFilter,
        major: majorFilter,
        nationality: nationalityFilter,
        gender: genderFilter,
      })
    ),
    [activeTableData, searchQuery, campusFilter, majorFilter, nationalityFilter, genderFilter]
  );

  const activeFiltersCount = useMemo(() =>
    [campusFilter, majorFilter, nationalityFilter, genderFilter, searchQuery].filter(Boolean).length,
    [campusFilter, majorFilter, nationalityFilter, genderFilter, searchQuery]
  );

  const stats = useMemo(() => ({
    total: filteredData.length,
    campuses: new Set(filteredData.map((r) => (r as { campus?: string }).campus).filter(Boolean)).size,
    nationalities: new Set(filteredData.map((r) => (r as { nationality?: string }).nationality).filter(Boolean)).size,
    majors: new Set(filteredData.map((r) => (r as { major?: string }).major).filter(Boolean)).size,
  }), [filteredData]);

  useEffect(() => {
    const stored = localStorage.getItem("psau-dark-mode");
    if (stored === "true") {
      document.documentElement.classList.add("dark");
    }
    requestAnimationFrame(() => setDarkMode(stored === "true"));
  }, []);

  useLayoutEffect(() => {
    const seen = localStorage.getItem("psau-disclaimer-seen-v2") === "true";
    if (seen) requestAnimationFrame(() => setShowDisclaimer(false));
  }, []);

  useEffect(() => {
    if (showDisclaimer) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [showDisclaimer]);

  const getTabComponent = (tabId: TabId) => {
    if (!tables) return <EmptyState loading={false} />;
    switch (tabId) {
      case "majors-nationalities":
        return <MajorsNationalitiesTab data={tables.table1} sortDir={sortDir} />;
      case "nationalities-majors":
        return <NationalitiesMajorsTab data={tables.table2} sortDir={sortDir} />;
      case "nationalities":
        return <NationalitiesTab data={tables.table3} sortDir={sortDir} />;
      case "majors":
        return <MajorsTab data={tables.table4} sortDir={sortDir} />;
      default:
        return <EmptyState loading={false} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-body)" }} dir="rtl">
      <DisclaimerModal show={showDisclaimer} onDismiss={dismissDisclaimer} />

      <Header
        onRefresh={() => fetchData(true)}
        refreshing={refreshing}
        onToggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-5 space-y-5 pb-16">
        <StatsBar
          total={stats.total}
          campuses={stats.campuses}
          nationalities={stats.nationalities}
          majors={stats.majors}
          loading={loading}
        />

        <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
          <span>{timeAgo && `آخر تحديث: ${timeAgo}`}</span>
        </div>

        <div className="tab-bar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  setActiveTab(tab.id);
                  e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                }}
                className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
                style={{ touchAction: "manipulation" }}
              >
                <span className="flex items-center justify-center gap-1.5 font-arabic">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          campusFilter={campusFilter}
          onCampusFilterChange={setCampusFilter}
          majorFilter={majorFilter}
          onMajorFilterChange={setMajorFilter}
          nationalityFilter={nationalityFilter}
          onNationalityFilterChange={setNationalityFilter}
          genderFilter={genderFilter}
          onGenderFilterChange={setGenderFilter}
          sortDir={sortDir}
          onSortDirChange={setSortDir}
          showFilters={showFilters}
          onShowFiltersChange={setShowFilters}
          activeFiltersCount={activeFiltersCount}
          onClearAllFilters={clearAllFilters}
          campuses={campuses}
          majors={majors}
          nationalities={nationalities}
          genderCounts={genderCounts}
          activeTab={activeTab}
        />

        <div key={activeTab}>
          {loading ? (
            <div className="space-y-3 animate-fade-in">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card p-4">
                  <div className="skeleton h-4 w-1/3 mb-3" />
                  <div className="skeleton h-3 w-2/3 mb-2" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            getTabComponent(activeTab)
          )}
        </div>

        {!loading && stats.total > 0 && (
          <div className="text-center text-xs py-2" style={{ color: "var(--text-muted)" }}>
            عرض {stats.total} سجل
            {activeFiltersCount > 0 && ` (من أصل ${activeTableData.length})`}
          </div>
        )}
      </main>

      <Footer />
      <MarqueeBar visible={true} />
    </div>
  );
}