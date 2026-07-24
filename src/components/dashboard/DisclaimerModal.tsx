"use client";

import Image from "next/image";

interface DisclaimerModalProps {
  show: boolean;
  onDismiss: () => void;
}

export default function DisclaimerModal({ show, onDismiss }: DisclaimerModalProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      style={{
        background: "var(--bg-overlay)",
        WebkitOverflowScrolling: "touch",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <div className="card-elevated max-w-lg w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto my-auto animate-fade-in-scale">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-between mb-4">
            <Image
              src="/dafaa25-logo.jpg"
              alt="شعار الدفعة"
              className="w-14 h-14 rounded-full object-cover"
              width={56}
              height={56}
              unoptimized
            />
            <Image
              src="/psau-logo.jpg"
              alt="جامعة الأمير سطام"
              className="w-14 h-14 rounded-full object-cover"
              width={56}
              height={56}
              unoptimized
            />
          </div>
          <h2 id="disclaimer-title" className="text-xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
            ⚠️ تنبيهات مهمة
          </h2>
        </div>

        <ul className="list-disc pr-5 space-y-3 text-sm leading-relaxed text-right" style={{ color: "var(--text-secondary)" }}>
          <li>جميع النسب المذكورة مجرد اجتهادات من الطلاب وليس لها صلة بالنسب الحقيقية أو أي ضمانات رسمية من الجامعة.</li>
          <li>هذه النسب لا تعطي بالضرورة أدنى نسبة قبولها بالجامعات وإنما مجرد إحصاءات للطلاب المشاركين.</li>
          <li>عدم وجود جنسية في جامعة معينة لا يعني أن الجامعة لا تقبل منها، بل عدم توفر معلومات عنها.</li>
          <li>عدم وجود تخصص معين في جامعة معينة لا يعني أنه محذوف، بل عدم توفر معلومات عنه <span className="font-medium" style={{ color: "var(--color-warning)" }}> (يستثنى من ذلك التخصصات الصحية فهي ممنوعة)</span>.</li>
          <li>اطمحوا لأعلى موزونة ممكنة. فالقبول تنافسي ويختلف حسب المقدمين كل عام.</li>
          <li>
            بعض النسب المنخفضة قد لا تعتمد على تفاصل الموزونات لأنها بعيدة عن المتوسط الطبيعي. لا يمكن تفسير هذا إلا أنه{" "}
            <span className="font-bold" style={{ color: "var(--color-warning)" }}>رزق ساقه الله إليهم.</span>{" "}
            فتوكلوا على الله ولا تيأسوا.
          </li>
          <li>إن أحسنا فمن الله، وإن أسأنا فمن أنفسنا والشيطان.</li>
        </ul>

        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-xl font-bold text-lg transition-all duration-200 min-h-[48px]"
          style={{
            background: "var(--color-primary)",
            color: "#ffffff",
            boxShadow: "0 4px 14px rgba(0, 119, 188, 0.3)",
            touchAction: "manipulation",
            fontFamily: "var(--font-display)",
          }}
        >
          موافق ✓
        </button>
      </div>
    </div>
  );
}