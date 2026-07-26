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
              src="/dafaa26-logo.png"
              alt="شعار الدفعة"
              className="w-14 h-14 rounded-full object-cover"
              width={56}
              height={56}
            />
            <Image
              src="/psau-logo.jpg"
              alt="جامعة الأمير سطام"
              className="w-14 h-14 rounded-full object-cover"
              width={56}
              height={56}
            />
          </div>
          <h2 id="disclaimer-title" className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            ⚠️ تنبيهات مهمة
          </h2>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-right" style={{ color: "var(--text-secondary)" }}>
          <div
            className="p-4 rounded-xl space-y-3"
            style={{
              background: "rgba(239, 68, 68, 0.06)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <p className="font-bold" style={{ color: "#ef4444" }}>⚠️ مصدر البيانات</p>
            <ul className="list-disc pr-5 space-y-2">
              <li>
                جميع النسب والموزونات المعروضة في هذا الموقع هي <span style={{ color: "#ef4444", fontWeight: 600 }}>مجرد اجتهاد طلابي (غير رسمي ولا يمثل الجامعة)</span> في جمعها، لذلك لن تكون دقيقة 100% ولن تمثل كامل الدفعة المقبولة وإنما من استطعنا الوصول إليهم وتطوعوا بتعبئة الاستبيان.
              </li>
              <li>
                هذه النسب <span style={{ color: "#ef4444", fontWeight: 600 }}>لا يمكن استخدامها للتنبؤ والجزم بقبول أو رفض موزونة معينة</span> في الأعوام القادمة، فهي لا تعطي بالضرورة أدنى نسبة قبول في الجامعات وإنما مجرد إحصاءات للطلاب المشاركين.
              </li>
            </ul>
          </div>

          <div
            className="p-4 rounded-xl space-y-3"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
            }}
          >
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>📋 ملاحظات</p>
            <ul className="list-disc pr-5 space-y-2">
              <li>عدم وجود جنسية في جامعة معينة لا يعني أن الجامعة لا تقبل منها، بل عدم توفر معلومات عنها.</li>
              <li>عدم وجود تخصص معين في جامعة معينة لا يعني أنه محذوف، بل عدم توفر معلومات عنه <strong style={{ color: "var(--accent-gold)" }}> (يستثنى من ذلك التخصصات الصحية فهي ممنوعة)</strong>.</li>
              <li>تختلف الدرجات والموزونات من عامٍ إلى الآخر، والأرقام المعروضة في هذا الموقع لا تتجاوز كونها إحصاء لما تم جمعه سابقًا.</li>
            </ul>
          </div>

          <div
            className="p-4 rounded-xl space-y-3"
            style={{
              background: "rgba(245, 158, 11, 0.06)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            <p className="font-bold" style={{ color: "var(--accent-gold)" }}>💡 كلمة أخيرة</p>
            <ul className="list-disc pr-5 space-y-2">
              <li>اطمحوا لأعلى موزونة ممكنة. فالقبول تنافسي ويختلف حسب المقدمين كل عام.</li>
              <li>
                بعض النسب المنخفضة قد لا تعتمد على تفاصيل الموزونات لأنها بعيدة عن المتوسط الطبيعي. لا يمكن تفسير هذا إلا أنه{" "}
                <strong style={{ color: "var(--accent-gold)" }}>رزق ساقه الله إليهم.</strong>{" "}
                فتوكلوا على الله ولا تيأسوا.
              </li>
            </ul>
            <p className="text-center pt-1" style={{ color: "var(--text-muted)" }}>
              إن أحسنا فمن الله، وإن أسأنا فمن أنفسنا والشيطان.
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-xl font-bold text-lg transition-all duration-200 min-h-[48px]"
          style={{
            background: "var(--olive-600)",
            color: "#ffffff",
            boxShadow: "0 4px 18px rgba(16, 185, 129, 0.35)",
            touchAction: "manipulation",
          }}
        >
          موافق ✓
        </button>
      </div>
    </div>
  );
}
