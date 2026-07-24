"use client";

import Image from "next/image";
import { RefreshCw, Moon, Sun } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
  onToggleDarkMode: () => void;
  darkMode: boolean;
}

export default function Header({ onRefresh, refreshing, onToggleDarkMode, darkMode }: HeaderProps) {
  return (
    <header
      className="glass-header py-4 px-4 md:px-6"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/psau-logo.jpg"
            alt="PSAU"
            className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-white/20"
            width={44}
            height={44}
            unoptimized
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base md:text-lg font-bold text-white">
                إحصائيات موزونات القبول
              </h1>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#fca5a5",
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </span>
                LIVE
              </span>
            </div>
            <p className="text-xs text-gray-300/80">
              جامعة الأمير سطام بن عبدالعزيز – دفعة 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg transition-all duration-200 text-white/70 hover:text-white hover:bg-white/10"
            style={{ touchAction: "manipulation" }}
            title="تحديث البيانات"
            aria-label="تحديث البيانات"
          >
            <RefreshCw className={`w-4.5 h-4.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg transition-all duration-200 text-white/70 hover:text-white hover:bg-white/10"
            style={{ touchAction: "manipulation" }}
            title={darkMode ? "وضع فاتح" : "وضع داكن"}
            aria-label={darkMode ? "التبديل للوضع الفاتح" : "التبديل للوضع الداكن"}
          >
            {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>
    </header>
  );
}