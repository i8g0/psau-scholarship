import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import dns from "dns";

// Fix Node.js IPv6 DNS resolution delay on Windows
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Non-critical: IPv6 fallback is fine
}

export const revalidate = 300; // 5 minutes

// ==========================================
// Types for 4 Tables inboundary 4 Tables
// ==========================================
interface Table1Record {
  campus: string;
  major: string;
  nationality: string;
  gender: string;
  maxScore: number;
  avgScore: number;
  minScore: number;
}

interface Table2Record {
  nationality: string;
  campus: string;
  major: string;
  gender: string;
  maxScore: number;
  avgScore: number;
  minScore: number;
}

interface Table3Record {
  nationality: string;
  gender: string;
  maxScore: number;
  avgScore: number;
  minScore: number;
}

interface Table4Record {
  campus: string;
  major: string;
  gender: string;
  maxScore: number;
  avgScore: number;
  minScore: number;
}

interface AllTablesData {
  table1: Table1Record[];
  table2: Table2Record[];
  table3: Table3Record[];
  table4: Table4Record[];
}

interface CacheItem {
  tables: AllTablesData;
  timestamp: number;
}

// In-Memory Global Cache across requests in Node runtime
const globalCache = globalThis as unknown as {
  admissionsCache?: CacheItem;
};

// Simple in-memory rate limiter (per-process, resets on restart)
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 100; // requests per window
const RATE_LIMIT_CLEANUP = 60_000; // prune stale entries every 60s
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  const timestamps = requestLog.get(ip) ?? [];
  const recent = timestamps.filter((t) => t > windowStart);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

// Periodic cleanup of stale IP entries to prevent unbounded Map growth
setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW;
  for (const [ip, timestamps] of requestLog) {
    const recent = timestamps.filter((t) => t > cutoff);
    if (recent.length === 0) {
      requestLog.delete(ip);
    } else {
      requestLog.set(ip, recent);
    }
  }
}, RATE_LIMIT_CLEANUP);

// ==========================================
// Google Sheets Fetcher with 5s Strict Timeout
// ==========================================
async function fetchFromGoogleSheets(): Promise<AllTablesData> {
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  const missing: string[] = [];
  if (!clientEmail) missing.push("GOOGLE_CLIENT_EMAIL");
  if (!privateKey) missing.push("GOOGLE_PRIVATE_KEY");
  if (!spreadsheetId) missing.push("SPREADSHEET_ID");
  if (missing.length > 0) {
    throw new Error(`Missing credentials: ${missing.join(", ")}`);
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // Add 5-second strict timeout wrapper to prevent 30s hangs
  const fetchPromise = sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Summery!A:AB",
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Google Sheets request timed out after 5s")), 5000)
  );

  const response = await Promise.race([fetchPromise, timeoutPromise]);
  const rows = response.data.values;

  if (!rows || rows.length < 2) {
    throw new Error("No data found in Summery sheet");
  }

  const table1: Table1Record[] = [];
  const table2: Table2Record[] = [];
  const table3: Table3Record[] = [];
  const table4: Table4Record[] = [];

  const warnings: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    // Table 1: Columns A-G (0-6): Campus, Major, Nationality, Gender, MAX, AVG, MIN
    if (row.length >= 7) {
      const [campus, major, nationality, gender, max, avg, min] = row;
      if (campus && major && gender) {
        const maxScore = parseFloat(String(max).replace(/,/g, "")) || 0;
        const avgScore = parseFloat(String(avg).replace(/,/g, "")) || 0;
        const minScore = parseFloat(String(min).replace(/,/g, "")) || 0;

        if (!(maxScore === 0 && avgScore === 0 && minScore === 0)) {
          if (avgScore < 0 || avgScore > 100) {
            const corrected = (maxScore + minScore) / 2;
            warnings.push(`Table1 row ${i}: Invalid avgScore=${avgScore} for ${campus}/${major}/${nationality}/${gender}. Corrected to ${corrected.toFixed(3)}`);
            table1.push({
              campus: String(campus).trim(),
              major: String(major).trim(),
              nationality: String(nationality || "غير محدد").trim(),
              gender: String(gender).trim(),
              maxScore,
              avgScore: corrected,
              minScore,
            });
          } else {
            table1.push({
              campus: String(campus).trim(),
              major: String(major).trim(),
              nationality: String(nationality || "غير محدد").trim(),
              gender: String(gender).trim(),
              maxScore,
              avgScore,
              minScore,
            });
          }
        }
      }
    }

    // Table 2: Columns I-O (8-14): Nationality, Branch, Major, Gender, MAX, AVG, MIN
    if (row.length >= 15) {
      const nationality2 = row[8];
      const campus2 = row[9];
      const major2 = row[10];
      const gender2 = row[11];
      const max2 = row[12];
      const avg2 = row[13];
      const min2 = row[14];

      if (nationality2 && campus2 && major2 && gender2) {
        const maxScore = parseFloat(String(max2).replace(/,/g, "")) || 0;
        const avgScore = parseFloat(String(avg2).replace(/,/g, "")) || 0;
        const minScore = parseFloat(String(min2).replace(/,/g, "")) || 0;

        if (!(maxScore === 0 && avgScore === 0 && minScore === 0)) {
          if (avgScore < 0 || avgScore > 100) {
            const corrected = (maxScore + minScore) / 2;
            warnings.push(`Table2 row ${i}: Invalid avgScore=${avgScore} for ${nationality2}/${campus2}/${major2}/${gender2}. Corrected to ${corrected.toFixed(3)}`);
            table2.push({
              nationality: String(nationality2).trim(),
              campus: String(campus2).trim(),
              major: String(major2).trim(),
              gender: String(gender2).trim(),
              maxScore,
              avgScore: corrected,
              minScore,
            });
          } else {
            table2.push({
              nationality: String(nationality2).trim(),
              campus: String(campus2).trim(),
              major: String(major2).trim(),
              gender: String(gender2).trim(),
              maxScore,
              avgScore,
              minScore,
            });
          }
        }
      }
    }

    // Table 3: Columns Q-U (16-20): Nationality, Gender, MAX, AVG, MIN
    if (row.length >= 21) {
      const nationality3 = row[16];
      const gender3 = row[17];
      const max3 = row[18];
      const avg3 = row[19];
      const min3 = row[20];

      if (nationality3 && gender3) {
        const maxScore = parseFloat(String(max3).replace(/,/g, "")) || 0;
        const avgScore = parseFloat(String(avg3).replace(/,/g, "")) || 0;
        const minScore = parseFloat(String(min3).replace(/,/g, "")) || 0;

        if (!(maxScore === 0 && avgScore === 0 && minScore === 0)) {
          if (avgScore < 0 || avgScore > 100) {
            const corrected = (maxScore + minScore) / 2;
            warnings.push(`Table3 row ${i}: Invalid avgScore=${avgScore} for ${nationality3}/${gender3}. Corrected to ${corrected.toFixed(3)}`);
            table3.push({
              nationality: String(nationality3).trim(),
              gender: String(gender3).trim(),
              maxScore,
              avgScore: corrected,
              minScore,
            });
          } else {
            table3.push({
              nationality: String(nationality3).trim(),
              gender: String(gender3).trim(),
              maxScore,
              avgScore,
              minScore,
            });
          }
        }
      }
    }

    // Table 4: Columns W-AB (22-27): Branch, Major, Gender, MAX, AVG, MIN
    if (row.length >= 28) {
      const campus4 = row[22];
      const major4 = row[23];
      const gender4 = row[24];
      const max4 = row[25];
      const avg4 = row[26];
      const min4 = row[27];

      if (campus4 && major4 && gender4) {
        const maxScore = parseFloat(String(max4).replace(/,/g, "")) || 0;
        const avgScore = parseFloat(String(avg4).replace(/,/g, "")) || 0;
        const minScore = parseFloat(String(min4).replace(/,/g, "")) || 0;

        if (!(maxScore === 0 && avgScore === 0 && minScore === 0)) {
          if (avgScore < 0 || avgScore > 100) {
            const corrected = (maxScore + minScore) / 2;
            warnings.push(`Table4 row ${i}: Invalid avgScore=${avgScore} for ${campus4}/${major4}/${gender4}. Corrected to ${corrected.toFixed(3)}`);
            table4.push({
              campus: String(campus4).trim(),
              major: String(major4).trim(),
              gender: String(gender4).trim(),
              maxScore,
              avgScore: corrected,
              minScore,
            });
          } else {
            table4.push({
              campus: String(campus4).trim(),
              major: String(major4).trim(),
              gender: String(gender4).trim(),
              maxScore,
              avgScore,
              minScore,
            });
          }
        }
      }
    }
  }

  if (warnings.length > 0 && process.env.NODE_ENV !== "production") {
    console.warn(`[Data Quality] ${warnings.length} corrections applied:`, warnings);
  }

  return { table1, table2, table3, table4 };
}

// ==========================================
// Background Poller: Runs every 5 minutes
// Starts on module load, runs autonomously
// ==========================================
const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

if (typeof globalCache.admissionsCache === "undefined") {
  // Initialize poller once per process
  setInterval(async () => {
    try {
      const tables = await fetchFromGoogleSheets();
      globalCache.admissionsCache = {
        tables,
        timestamp: Date.now(),
      };
      if (process.env.NODE_ENV !== "production") {
        const totalRecords = tables.table1.length + tables.table2.length + tables.table3.length + tables.table4.length;
        console.log(`[Poller] Cache updated: ${totalRecords} total records at ${new Date().toISOString()}`);
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[Poller] Failed to refresh from Sheets:", err instanceof Error ? err.message : err);
      }
      // Keep last good cache - do not clear it
    }
  }, POLL_INTERVAL);
}

// ==========================================
// GET Handler: Always returns cache (or cold-start fetches once)
// ==========================================
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const now = Date.now();
  const cacheAge = 5 * 60 * 1000; // 5 minutes

  // 1. Cache exists and is fresh -> return immediately
  if (globalCache.admissionsCache && now - globalCache.admissionsCache.timestamp < cacheAge) {
    const { tables, timestamp } = globalCache.admissionsCache;
    const totalRecords = tables.table1.length + tables.table2.length + tables.table3.length + tables.table4.length;
    return NextResponse.json(
      {
        tables,
        count: totalRecords,
        source: "google-sheets",
        timestamp: new Date(timestamp).toISOString(),
        dataQuality: {
          recordCounts: {
            table1: tables.table1.length,
            table2: tables.table2.length,
            table3: tables.table3.length,
            table4: tables.table4.length,
          },
          lastChecked: new Date(timestamp).toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  }

  // 2. Cache exists but stale -> serve stale data, trigger background refresh
  if (globalCache.admissionsCache) {
    // Fire-and-forget background refresh
    fetchFromGoogleSheets()
      .then((tables) => {
        globalCache.admissionsCache = {
          tables,
          timestamp: Date.now(),
        };
        if (process.env.NODE_ENV !== "production") {
          const totalRecords = tables.table1.length + tables.table2.length + tables.table3.length + tables.table4.length;
          console.log(`[Revalidation] Cache updated: ${totalRecords} total records`);
        }
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("[Revalidation] Failed to refresh:", err instanceof Error ? err.message : err);
        }
      });

    const { tables, timestamp } = globalCache.admissionsCache;
    const totalRecords = tables.table1.length + tables.table2.length + tables.table3.length + tables.table4.length;
    return NextResponse.json(
      {
        tables,
        count: totalRecords,
        source: "google-sheets",
        timestamp: new Date(timestamp).toISOString(),
        dataQuality: {
          recordCounts: {
            table1: tables.table1.length,
            table2: tables.table2.length,
            table3: tables.table3.length,
            table4: tables.table4.length,
          },
          lastChecked: new Date(timestamp).toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  }

  // 3. Cold start (no cache at all): block once, fetch live, populate cache
  try {
    const tables = await fetchFromGoogleSheets();
    globalCache.admissionsCache = {
      tables,
      timestamp: now,
    };
    const totalRecords = tables.table1.length + tables.table2.length + tables.table3.length + tables.table4.length;
    return NextResponse.json(
      {
        tables,
        count: totalRecords,
        source: "google-sheets",
        timestamp: new Date(now).toISOString(),
        dataQuality: {
          recordCounts: {
            table1: tables.table1.length,
            table2: tables.table2.length,
            table3: tables.table3.length,
            table4: tables.table4.length,
          },
          lastChecked: new Date(now).toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    // No cache exists AND Sheets failed -> 500
    return NextResponse.json(
      { error: "Failed to fetch initial data from Google Sheets" },
      { status: 500 }
    );
  }
}