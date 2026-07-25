"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { SortDir } from "@/types";

interface SortToggleProps {
  value: SortDir;
  onChange: (val: SortDir) => void;
  label?: string;
}

const SORT_OPTIONS = [
  { value: "none", label: "الترتيب الافتراضي" },
  { value: "desc", label: "الأعلى موزونة أولاً" },
  { value: "asc", label: "الأدنى موزونة أولاً" },
] as const;

export function SortToggle({
  value,
  onChange,
  label = "ترتيب المجموعات حسب الموزونة",
}: SortToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOption = SORT_OPTIONS.find((opt) => opt.value === value);

  const handleSelect = (val: SortDir) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>

      <button
        ref={buttonRef}
        onClick={() => {
          const next = !isOpen;
          if (next && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const estimatedMenuHeight = SORT_OPTIONS.length * 44 + 8;
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            setDropUp(spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow);
          }
          setIsOpen(next);
        }}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 min-h-[44px]"
        style={{
          background: "var(--bg-input)",
          border: "1px solid var(--border-default)",
          color: "var(--text-primary)",
          touchAction: "manipulation",
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <span>{activeOption?.label}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={`dropdown-menu absolute z-[60] w-full animate-fade-in-scale ${dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"}`}
          role="listbox"
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              role="option"
              aria-selected={value === option.value}
              className={`dropdown-item w-full text-right ${value === option.value ? "selected" : ""}`}
              style={{ touchAction: "manipulation" }}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}