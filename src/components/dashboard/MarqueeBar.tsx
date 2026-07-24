"use client";

import { useState, useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface MarqueeBarProps {
  visible: boolean;
}

export default function MarqueeBar({ visible }: MarqueeBarProps) {
  const [isPaused, setIsPaused] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marqueeElement = marqueeRef.current;
    if (!marqueeElement) return;

    let animationFrameId: number;

    const animate = () => {
      if (!isPaused && visible) {
        requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused, visible]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  if (!visible) return null;

  return (
    <div
      ref={marqueeRef}
      className={`marquee-bar ${visible ? "" : "marquee-bar-hidden"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="glass h-full marquee-inner">
        <span className="marquee-label">
          <AlertTriangle className="w-3.5 h-3.5" />
          تنبيه هام
        </span>
        <div className="marquee-track">
          <div className="marquee-content">
            <span className="inline-flex items-center whitespace-nowrap px-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              جميع النسب المذكورة هي إحصاءات واجتهادات طلابية (دفعة 2026) ولا تمثل الحد الأدنى الرسمي للجامعة.
            </span>
            <span style={{ color: "var(--border-default)", margin: "0 8px" }}>•</span>
            <span className="inline-flex items-center whitespace-nowrap px-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              عدم وجود جنسية أو تخصص يعني عدم توفر بيانات، وليس الرفض.
            </span>
            <span style={{ color: "var(--border-default)", margin: "0 8px" }}>•</span>
            <span className="inline-flex items-center whitespace-nowrap px-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              القبول تنافسي، فاطمح دائماً لأعلى موزونة ممكنة.
            </span>
            <span style={{ color: "var(--border-default)", margin: "0 8px" }}>•</span>
            <span className="inline-flex items-center whitespace-nowrap px-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              توكلوا على الله ولا تيأسوا 🤲
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}