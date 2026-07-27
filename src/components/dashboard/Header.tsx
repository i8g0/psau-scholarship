"use client";

import Image from "next/image";
import { RefreshCw, Moon, Sun } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
  onToggleDarkMode: () => void;
  darkMode: boolean;
  onNazaaClick: () => void;
}

export default function Header({ onRefresh, refreshing, onToggleDarkMode, darkMode, onNazaaClick }: HeaderProps) {
  return (
    <header
      className="glass-header py-3 px-3 sm:py-4 sm:px-6"
      style={{ borderBottom: "1px solid var(--border-default)" }}
    >
      {/* ── Desktop layout ── */}
      <div className="max-w-7xl mx-auto hidden sm:flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src="/psau-logo.jpg"
            alt="PSAU"
            className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-white/20"
            width={44}
            height={44}
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base md:text-lg font-bold font-arabic text-white">
                إحصائيات موزونات القبول
              </h1>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap"
                style={{
                  background: "rgba(239, 68, 68, 0.2)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  color: "#ef4444",
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full"
                    style={{ backgroundColor: "#ef4444", opacity: 0.75 }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ backgroundColor: "#ef4444" }}
                  />
                </span>
                LIVE
              </span>
            </div>
            <p className="text-xs font-medium" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
              جامعة الأمير سطام بن عبدالعزيز – دفعة 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNazaaClick}
            className="px-2.5 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap"
            style={{
              color: "#ffffff",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              touchAction: "manipulation",
            }}
            title="ما هو مقياس النزعة؟"
            aria-label="ما هو مقياس النزعة؟"
          >
            ما هو مقياس النزعة؟
          </button>

          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg transition-all duration-200"
            style={{
              color: "#ffffff",
              backgroundColor: "rgba(255,255,255,0.1)",
              touchAction: "manipulation",
            }}
            title="تحديث البيانات"
            aria-label="تحديث البيانات"
          >
            <RefreshCw className={`w-4.5 h-4.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg transition-all duration-200"
            style={{
              color: "#ffffff",
              backgroundColor: "rgba(255,255,255,0.1)",
              touchAction: "manipulation",
            }}
            title={darkMode ? "وضع فاتح" : "وضع داكن"}
            aria-label={darkMode ? "التبديل للوضع الفاتح" : "التبديل للوضع الداكن"}
          >
            {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="max-w-7xl mx-auto sm:hidden flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Image
            src="/psau-logo.jpg"
            alt="PSAU"
            className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-white/20"
            width={44}
            height={44}
          />
          <h1 className="text-sm font-bold font-arabic text-white truncate">
            إحصائيات موزونات القبول
          </h1>
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap flex-shrink-0"
            style={{
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#ef4444",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full"
                style={{ backgroundColor: "#ef4444", opacity: 0.75 }}
              />
              <span
                className="relative inline-flex rounded-full h-1.5 w-1.5"
                style={{ backgroundColor: "#ef4444" }}
              />
            </span>
          </span>
          <div className="flex items-center gap-1 mr-auto">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="p-1.5 rounded-lg transition-all duration-200"
              style={{
                color: "#ffffff",
                backgroundColor: "rgba(255,255,255,0.1)",
                touchAction: "manipulation",
              }}
              title="تحديث البيانات"
              aria-label="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-lg transition-all duration-200"
              style={{
                color: "#ffffff",
                backgroundColor: "rgba(255,255,255,0.1)",
                touchAction: "manipulation",
              }}
              title={darkMode ? "وضع فاتح" : "وضع داكن"}
              aria-label={darkMode ? "التبديل للوضع الفاتح" : "التبديل للوضع الداكن"}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium truncate" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
            جامعة الأمير سطام بن عبدالعزيز – دفعة 2026
          </p>
          <button
            onClick={onNazaaClick}
            className="px-2 py-1 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap"
            style={{
              color: "#ffffff",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              touchAction: "manipulation",
            }}
            title="ما هو مقياس النزعة؟"
            aria-label="ما هو مقياس النزعة؟"
          >
            ما هو مقياس النزعة؟
          </button>
        </div>
      </div>
    </header>
  );
}
