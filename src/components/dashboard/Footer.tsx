"use client";

import Image from "next/image";

interface FooterProps {
  timeAgo?: string;
  lastUpdate?: Date | null;
}

export default function Footer({ timeAgo, lastUpdate }: FooterProps) {
  return (
    <footer
      id="footer-ref"
      className="py-6 px-4 md:px-6 mt-auto pb-14 md:pb-6"
      style={{
        background: "var(--olive-800)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/psau-logo.jpg"
            alt="PSAU"
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            width={40}
            height={40}
            unoptimized
          />
          <div>
            <p className="text-sm font-medium text-white">طلاب منح جامعة الأمير سطام</p>
            <p className="text-xs text-gray-300/60">دفعة 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-300/60">
          <a
            href="https://t.me/psau_scholarship_student"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors min-h-[44px] flex items-center"
            style={{ touchAction: "manipulation" }}
          >
            @psau_scholarship_student
          </a>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
          <span className="text-xs">© {new Date().getFullYear()} جميع الحقوق محفوظة</span>
        </div>
      </div>
    </footer>
  );
}