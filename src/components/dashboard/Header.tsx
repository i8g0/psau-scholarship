"use client";

import Image from "next/image";
import { RefreshCw, Moon, Sun, HelpCircle } from "lucide-react";

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
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
          <Image
            src="/psau-logo.jpg"
            alt="PSAU"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-white/20"
            width={44}
            height={44}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <h1 className="text-sm sm:text-base md:text-lg font-bold font-arabic text-white truncate max-w-[160px] xs:max-w-none">
                إحصائيات موزونات القبول
              </h1>
              <span
                className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap badge-glow-emerald"
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  color: "var(--live-text)",
                }}
              >
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full"
                    style={{ backgroundColor: "var(--live-text)", opacity: 0.75 }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2"
                    style={{ backgroundColor: "var(--live-text)" }}
                  />
                </span>
                <span className="hidden sm:inline">بث مباشر</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-xs font-medium hidden sm:block" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
              جامعة الأمير سطام بن عبدالعزيز – دفعة 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onNazaaClick}
            className="px-2 sm:px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap"
            style={{
              color: "#ffffff",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              touchAction: "manipulation",
            }}
            title="ما هو مقياس النزعة؟"
            aria-label="ما هو مقياس النزعة؟"
          >
            <span className="hidden sm:inline">ما هو مقياس النزعة؟</span>
            <span className="sm:hidden flex items-center justify-center">
              <HelpCircle className="w-4.5 h-4.5" />
            </span>
          </button>

          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-1.5 sm:p-2 rounded-lg transition-all duration-200"
            style={{
              color: "#ffffff",
              backgroundColor: "rgba(255,255,255,0.1)",
              touchAction: "manipulation",
            }}
            title="تحديث البيانات"
            aria-label="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-1.5 sm:p-2 rounded-lg transition-all duration-200"
            style={{
              color: "#ffffff",
              backgroundColor: "rgba(255,255,255,0.1)",
              touchAction: "manipulation",
            }}
            title={darkMode ? "وضع فاتح" : "وضع داكن"}
            aria-label={darkMode ? "التبديل للوضع الفاتح" : "التبديل للوضع الداكن"}
          >
            {darkMode ? <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
