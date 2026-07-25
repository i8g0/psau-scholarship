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

    const animate = () => {
      if (!isPaused && visible) {
        requestAnimationFrame(animate);
      }
    };

    const animationFrameId = requestAnimationFrame(animate);

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
      <div className="card h-full marquee-inner" style={{ background: "var(--color-warning)", borderColor: "var(--color-warning)" }}>
        <span className="marquee-label" style={{ fontFamily: "var(--font-arabic)", color: "#000" }}>
          <AlertTriangle className="w-3.5 h-3.5" />
          تنبيه هام
        </span>
        <div className="marquee-track">
          <div className="marquee-content">
            {/* First copy */}
            <span className="inline-flex items-center whitespace-nowrap px-3 text-sm font-medium" style={{ color: "#000" }}>
              جميع النسب المذكورة هي إحصاءات واجتهادات طلابية (دفعة 2026) ولا تمثل الحد الأدنى الرسمي للجامعة.
            </span>
            <span style={{ color: "#000", opacity: 0.5, margin: "0 8px" }}>•</span>
            <span className="inline-flex items-center whitespace-nowrap px-3 text-sm font-medium" style={{ color: "#000" }}>
              عدم وجود جنسية أو تخصص يعني عدم توفر بيانات، وليس الرفض.
            </span>
            <span style={{ color: "#000", opacity: 0.5, margin: "0 8px" }}>•</span>
            <span className="inline-flex items-center whitespace-nowrap px-3 text-sm font-medium" style={{ color: "#000" }}>
              القبول تنافسي، فاطمح دائماً لأعلى موزونة ممكنة.
            </span>
            <span style={{ color: "#000", opacity: 0.5, margin: "0 8px" }}>•</span>
            <span className="inline-flex items-center whitespace-nowrap px-3 text-sm font-medium" style={{ color: "#000" }}>
              توكلوا على الله ولا تيأسوا 🤲
            </span>
            {/* Second copy (duplicate) for seamless loop */}
            <span style={{ color: "#000", opacity: 0.5, margin: "0 8px" }}>•</span>
            <span className="inline-flex items-center whitespace-nowrap px-3 text-sm font-medium" style={{ color: "#000" }}>
              جميع النسب المذكورة هي إحصاءات واجتهادات طلابية (دفعة 2026) ولا تمثل الحد الأدنى الرسمي للجامعة.
            </span>
            <span style={{ color: "#000", opacity: 0.5, margin: "0 8px" }}>•</span>
            <span className="inline-flex items-center whitespace-nowrap px-3 text-sm font-medium" style={{ color: "#000" }}>
              عدم وجود جنسية أو تخصص يعني عدم توفر بيانات، وليس الرفض.
            </span>
            <span style={{ color: "#000", opacity: 0.5, margin: "0 8px" }}>•</span>
            <span className="inline-flex items-center whitespace-nowrap px-3 text-sm font-medium" style={{ color: "#000" }}>
              القبول تنافسي، فاطمح دائماً لأعلى موزونة ممكنة.
            </span>
            <span style={{ color: "#000", opacity: 0.5, margin: "0 8px" }}>•</span>
            <span className="inline-flex items-center whitespace-nowrap px-3 text-sm font-medium" style={{ color: "#000" }}>
              توكلوا على الله ولا تيأسوا 🤲
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}