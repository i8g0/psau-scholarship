"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from "react";
import { Search, ChevronDown, X, Filter, Users, Globe2, TrendingUp, TrendingDown, BarChart3, Moon, Sun, RefreshCw, BookOpen, MapPin, Minimize2, EyeOff, AlertTriangle, GitBranch, Share2 } from "lucide-react";
import { useAdmissions } from "@/hooks/useAdmissions";
import { TABS, AdmissionRecord, SortDir, TabId, FilterOpts, normalizeArabic, sortGroups, sortByScore, meanOf, matchesFilters, countBy, fmt, aggregateRecords } from "@/types";
import { GenderBadge, AccentCell, ScoreCells, ScoreCards, EmptyState } from "@/components/ui";
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
  const { records: allRecords, loading, error, lastUpdate, refreshing, fetchData, timeAgo } = useAdmissions();

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
  const [marqueeVisible, setMarqueeVisible] = useState(true);

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

  const campuses = useMemo(() => [...new Set(allRecords.map((r) => r.campus))].sort(), [allRecords]);
  const majors = useMemo(() => [...new Set(allRecords.map((r) => r.major))].sort(), [allRecords]);
  const nationalities = useMemo(() => [...new Set(allRecords.map((r) => r.nationality))].sort(), [allRecords]);

  const genderCounts = useMemo(() => ({
    "ذكر": allRecords.filter((r) => r.gender === "ذكر").length,
    "أنثى": allRecords.filter((r) => r.gender === "أنثى").length,
  }), [allRecords]);

  const filteredData = useMemo(() =>
    allRecords.filter((r) =>
      matchesFilters(r, {
        search: searchQuery,
        campus: campusFilter,
        major: majorFilter,
        nationality: nationalityFilter,
        gender: genderFilter,
      })
    ),
    [allRecords, searchQuery, campusFilter, majorFilter, nationalityFilter, genderFilter]
  );

  const activeFiltersCount = useMemo(() =>
    [campusFilter, majorFilter, nationalityFilter, genderFilter, searchQuery].filter(Boolean).length,
    [campusFilter, majorFilter, nationalityFilter, genderFilter, searchQuery]
  );

  const stats = useMemo(() => ({
    total: filteredData.length,
    campuses: new Set(filteredData.map((r) => r.campus)).size,
    nationalities: new Set(filteredData.map((r) => r.nationality)).size,
    majors: new Set(filteredData.map((r) => r.major)).size,
  }), [filteredData]);

  useEffect(() => {
    const footerEl = document.getElementById("footer-ref");
    if (!footerEl || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setMarqueeVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(footerEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("psau-dark-mode");
    if (stored === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useLayoutEffect(() => {
    if (localStorage.getItem("psau-disclaimer-seen-v2") === "true") {
      setShowDisclaimer(false);
    }
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
    switch (tabId) {
      case "majors-nationalities":
        return <MajorsNationalitiesTab data={filteredData} sortDir={sortDir} />;
      case "nationalities-majors":
        return <NationalitiesMajorsTab data={filteredData} sortDir={sortDir} />;
      case "nationalities":
        return <NationalitiesTab data={filteredData} sortDir={sortDir} />;
      case "majors":
        return <MajorsTab data={filteredData} sortDir={sortDir} />;
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
            {activeFiltersCount > 0 && ` (من أصل ${allRecords.length})`}
          </div>
        )}
      </main>

      <Footer timeAgo={timeAgo} lastUpdate={lastUpdate} />
      <MarqueeBar visible={marqueeVisible} />
    </div>
  );
}