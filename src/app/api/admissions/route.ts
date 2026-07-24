import { NextResponse } from "next/server";
import { google } from "googleapis";
import dns from "dns";

// Fix Node.js IPv6 DNS resolution delay on Windows
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}

export const revalidate = 300; // 5 minutes

// ==========================================
// Types
// ==========================================
interface AdmissionRecord {
  campus: string;
  major: string;
  nationality: string;
  gender: string;
  maxScore: number;
  avgScore: number;
  minScore: number;
}

interface CacheItem {
  records: AdmissionRecord[];
  timestamp: number;
}

// In-Memory Global Cache across requests in Node runtime
const globalCache = globalThis as unknown as {
  admissionsCache?: CacheItem;
};

// ==========================================
// Google Sheets Fetcher with 5s Strict Timeout
// ==========================================
async function fetchFromGoogleSheets(): Promise<AdmissionRecord[]> {
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error("Missing Google Service Account credentials in environment variables");
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
    range: "Summery!A:G",
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Google Sheets request timed out after 5s")), 5000)
  );

  const response = await Promise.race([fetchPromise, timeoutPromise]);
  const rows = response.data.values;

  if (!rows || rows.length < 2) {
    throw new Error("No data found in Summery sheet");
  }

  const records: AdmissionRecord[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 7) continue;

    const [campus, major, nationality, gender, max, avg, min] = row;
    if (!campus || !major || !gender) continue;

    const maxScore = parseFloat(String(max).replace(/,/g, "")) || 0;
    const avgScore = parseFloat(String(avg).replace(/,/g, "")) || 0;
    const minScore = parseFloat(String(min).replace(/,/g, "")) || 0;

    if (maxScore === 0 && avgScore === 0 && minScore === 0) continue;

    records.push({
      campus: String(campus).trim(),
      major: String(major).trim(),
      nationality: String(nationality || "غير محدد").trim(),
      gender: String(gender).trim(),
      maxScore,
      avgScore,
      minScore,
    });
  }

  return records;
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
      const records = await fetchFromGoogleSheets();
      globalCache.admissionsCache = {
        records,
        timestamp: Date.now(),
      };
      console.log(`[Poller] Cache updated: ${records.length} records at ${new Date().toISOString()}`);
    } catch (err) {
      console.error("[Poller] Failed to refresh from Sheets:", err instanceof Error ? err.message : err);
      // Keep last good cache - do not clear it
    }
  }, POLL_INTERVAL);
}

// ==========================================
// GET Handler: Always returns cache (or cold-start fetches once)
// ==========================================
export async function GET() {
  const now = Date.now();
  const cacheAge = 5 * 60 * 1000; // 5 minutes

  // 1. Cache exists and is fresh -> return immediately
  if (globalCache.admissionsCache && now - globalCache.admissionsCache.timestamp < cacheAge) {
    return NextResponse.json(
      {
        records: globalCache.admissionsCache.records,
        count: globalCache.admissionsCache.records.length,
        source: "google-sheets",
        timestamp: new Date(globalCache.admissionsCache.timestamp).toISOString(),
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
      .then((records) => {
        globalCache.admissionsCache = {
          records,
          timestamp: Date.now(),
        };
        console.log(`[Revalidation] Cache updated: ${records.length} records`);
      })
      .catch((err) => {
        console.error("[Revalidation] Failed to refresh:", err instanceof Error ? err.message : err);
      });

    return NextResponse.json(
      {
        records: globalCache.admissionsCache.records,
        count: globalCache.admissionsCache.records.length,
        source: "google-sheets",
        timestamp: new Date(globalCache.admissionsCache.timestamp).toISOString(),
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
    const records = await fetchFromGoogleSheets();
    globalCache.admissionsCache = {
      records,
      timestamp: now,
    };
    return NextResponse.json(
      {
        records,
        count: records.length,
        source: "google-sheets",
        timestamp: new Date(now).toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    // No cache exists AND Sheets failed -> 500
    return NextResponse.json(
      { error: "Failed to fetch initial data from Google Sheets" },
      { status: 500 }
    );
  }
}