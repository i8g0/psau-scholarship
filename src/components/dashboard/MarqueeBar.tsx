"use client";

import { useState, useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface MarqueeBarProps {
  visible: boolean;
}

export default function MarqueeBar({ visible }: MarqueeBarProps) {
  const [isPaused, setIsPaused] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const messages = [
    "جميع النسب المذكورة هي إحصاءات واجتهادات طلابية (دفعة 2026) ولا تمثل الحد الأدنى الرسمي للجامعة.",
    "عدم وجود جنسية أو تخصص يعني عدم توفر بيانات، وليس الرفض.",
    "القبول تنافسي، فاطمح دائماً لأعلى موزونة ممكنة.",
    "توكلوا على الله ولا تيأسوا 🤲",
  ];

  return (
    <div
      ref={marqueeRef}
      className={`marquee-bar ${visible ? "" : "marquee-bar-hidden"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="marquee-inner">
        <span className="marquee-label">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          تنبيه هام
        </span>
        <div className="marquee-track">
          <div className={`marquee-content ${isPaused ? "marquee-paused" : ""}`}>
            {[...messages, ...messages].map((msg, idx) => (
              <span key={idx} className="inline-flex items-center whitespace-nowrap px-3 text-xs md:text-sm font-semibold marquee-text">
                {msg}
                <span className="marquee-dot">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
