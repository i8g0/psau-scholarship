"use client";

import { useCallback, useEffect, useState } from "react";
import { AdmissionRecord } from "@/types";

interface UseAdmissionsReturn {
  records: AdmissionRecord[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refreshing: boolean;
  fetchData: (isRefresh?: boolean) => Promise<void>;
  timeAgo: string;
}

export function useAdmissions(): UseAdmissionsReturn {
  const [records, setRecords] = useState<AdmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/admissions");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.records) {
        setRecords(json.records);
        setLastUpdate(new Date());
        setError(null);
      } else {
        throw new Error("Malformed response: missing records");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch admissions data";
      setError(errorMessage);
      console.error("[Admissions Hook] Failed to fetch:", errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const timeAgo = (() => {
    if (!lastUpdate) return "";
    const diff = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
    if (diff < 10) return "الآن";
    if (diff < 60) return `منذ ${diff} ثانية`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `منذ ${mins} دقيقة`;
    return `منذ ${Math.floor(mins / 60)} ساعة`;
  })();

  return {
    records,
    loading,
    error,
    lastUpdate,
    refreshing,
    fetchData,
    timeAgo,
  };
}