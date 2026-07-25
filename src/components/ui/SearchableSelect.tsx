"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { normalizeArabic } from "@/types";

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  counts?: Record<string, number>;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  icon: Icon,
  counts,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = normalizeArabic(search);
    return options.filter((o) => normalizeArabic(o).includes(q));
  }, [options, search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setHighlighted(0);
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [open]);

  function selectIndex(idx: number) {
    if (idx === 0) {
      onChange("");
    } else {
      const opt = filtered[idx - 1];
      if (opt !== undefined) onChange(opt);
    }
    setOpen(false);
    setSearch("");
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    const totalItems = filtered.length + 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, totalItems - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectIndex(highlighted);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setSearch("");
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 min-h-[44px]"
        style={{
          background: "var(--bg-input)",
          border: "1px solid var(--border-default)",
          color: value ? "var(--text-primary)" : "var(--text-muted)",
          touchAction: "manipulation",
        }}
      >
        <span className="flex items-center gap-2 truncate pr-8">
          {Icon && <Icon className="w-4 h-4 flex-shrink-0 opacity-50" />}
          <span className="truncate">{value || placeholder}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 opacity-50 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className="dropdown-menu absolute z-[60] mt-1.5 w-full animate-fade-in-scale"
          style={{ minWidth: "200px" }}
          role="listbox"
          id={listId}
        >
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{ borderBottom: "1px solid var(--border-default)" }}
          >
            <Search className="w-4 h-4 flex-shrink-0 opacity-50" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlighted(0);
              }}
              onKeyDown={handleInputKeyDown}
              className="flex-1 text-sm outline-none bg-transparent pr-10"
              style={{ color: "var(--text-primary)" }}
              placeholder="بحث..."
              aria-autocomplete="list"
              aria-controls={listId}
            />
            {value && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                  setSearch("");
                }}
                aria-label="مسح الاختيار"
                style={{ color: "var(--text-muted)", touchAction: "manipulation" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto">
            <button
              onClick={() => selectIndex(0)}
              role="option"
              aria-selected={value === ""}
              className={`dropdown-item w-full text-right ${highlighted === 0 ? "highlighted" : ""}`}
              style={{ touchAction: "manipulation", color: "var(--text-muted)" }}
            >
              الكل
            </button>
            {filtered.map((opt, idx) => (
              <button
                key={opt}
                onClick={() => selectIndex(idx + 1)}
                role="option"
                aria-selected={value === opt}
                className={`dropdown-item w-full text-right ${value === opt ? "selected" : ""} ${highlighted === idx + 1 ? "highlighted" : ""}`}
                style={{ touchAction: "manipulation" }}
              >
                <span className="truncate">{opt}</span>
                {counts && counts[opt] !== undefined && (
                  <span className="count">{counts[opt]}</span>
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                لا توجد نتائج
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}