"use client";

import { useCallback, useEffect, useState } from "react";
import { TablesData } from "@/types";

interface UseAdmissionsReturn {
  tables: TablesData | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refreshing: boolean;
  fetchData: (isRefresh?: boolean) => Promise<void>;
  timeAgo: string;
}

export function useAdmissions(): UseAdmissionsReturn {
  const [tables, setTables] = useState<TablesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeAgo, setTimeAgo] = useState("");

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/admissions");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.tables) {
        setTables(json.tables);
        setLastUpdate(new Date());
        setError(null);
      } else {
        throw new Error("Malformed response: missing tables");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch admissions data";
      setError(errorMessage);
      if (process.env.NODE_ENV !== "production") {
        console.error("[Admissions Hook] Failed to fetch:", errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      fetchData();
    });
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastUpdate) return;
      const diff = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
      if (diff < 10) {
        setTimeAgo("الآن");
      } else if (diff < 60) {
        setTimeAgo(`منذ ${diff} ثانية`);
      } else if (diff < 3600) {
        setTimeAgo(`منذ ${Math.floor(diff / 60)} دقيقة`);
      } else {
        setTimeAgo(`منذ ${Math.floor(diff / 3600)} ساعة`);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  return {
    tables,
    loading,
    error,
    lastUpdate,
    refreshing,
    fetchData,
    timeAgo,
  };
}