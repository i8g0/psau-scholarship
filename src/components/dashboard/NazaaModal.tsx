"use client";

export default function NazaaModal({ show, onDismiss }: { show: boolean; onDismiss: () => void }) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{
        background: "var(--bg-overlay)",
        WebkitOverflowScrolling: "touch",
        overflowX: "hidden",
        overscrollBehavior: "contain",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="nazaa-title"
    >
      <div className="card-elevated max-w-lg w-full p-5 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto my-auto animate-fade-in-scale">
        <h2
          id="nazaa-title"
          className="text-xl font-bold text-center"
          style={{ color: "var(--text-primary)" }}
        >
          ما هو مقياس النزعة؟
        </h2>

        <div className="space-y-4 text-sm leading-relaxed text-right" style={{ color: "var(--text-secondary)" }}>
          <p>
            نظرًا للتفاوت الملحوظ الذي وجدناه في موزونات دفعة 2025، قررنا حينها اعتماد دالة أطلقنا عليها <strong style={{ color: "var(--accent-gold, #d97706)" }}>&quot;مقياس النزعة&quot;</strong> لتكون الدالة الأساسية لقياس النزعة المركزية في تجميع الموزونات.
          </p>

          <p>
            <strong style={{ color: "var(--accent-gold, #d97706)" }}>مقياس النزعة</strong> هو أداة بسيطة تساعدك على معرفة فرص قبولك بناءً على درجاتك ومتوسط/وسيط الموزونات التي تم قبولها في الجامعة لتساعدك في اختيار التخصصات والفروع المتناسبة مع درجتك الموزونة.
          </p>

          <div
            className="p-4 rounded-xl space-y-3"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
            }}
          >
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>الدالة تسير على النحو التالي:</p>

            <ol className="list-decimal pr-5 space-y-2">
              <li>يتم حساب <strong style={{ color: "var(--accent-gold, #d97706)" }}>الانحراف المعياري</strong> للعينة المختارة.</li>
              <li>في حال كان الانحراف المعياري يزيد عن قيمة معينة نحددها مسبقًا (أسميناها <strong style={{ color: "var(--accent-gold, #d97706)" }}>&quot;النقطة الحرجة&quot;</strong>)، يتم عرض <strong style={{ color: "var(--accent-gold, #d97706)" }}>وسيط القيم</strong>.</li>
              <li>في حال كان الانحراف المعياري لا يزيد عن النقطة الحرجة، يتم عرض <strong style={{ color: "var(--accent-gold, #d97706)" }}>المتوسط الحسابي</strong> للقيم.</li>
            </ol>
          </div>

          <p>
            يمكنك معرفة قيمة <strong style={{ color: "var(--accent-gold, #d97706)" }}>النقطة الحرجة</strong> لموزونات الدفعة التي تطلع عليها من خلال الصفحة الرئيسية لتلك الدفعة.
          </p>

          <div
            className="p-4 rounded-xl space-y-3"
            style={{
              background: "rgba(239, 68, 68, 0.06)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <p className="font-bold" style={{ color: "#ef4444" }}>ملاحظات هامة:</p>
            <ul className="list-disc pr-5 space-y-2">
              <li>هذه الطريقة هي مجرد أداة وضعناها ليكون إحصاء الموزونات أكثر دقة وتناسبًا معها، <span style={{ color: "#ef4444", fontWeight: 600 }}>ولا يمكن استخدامها للتنبؤ والجزم بقبول أو رفض موزونة معينة</span> في الأعوام القادمة.</li>
              <li>تختلف الدرجات والموزونات من عامٍ إلى الآخر، والأرقام المعروضة في هذا الموقع لا تتجاوز كونها إحصاء لما تم جمعه سابقًا.</li>
              <li>الموزونات التي تستند عليها هذه الإحصائيات، هي <span style={{ color: "#ef4444", fontWeight: 600 }}>مجرد اجتهاد طلابي (غير رسمي ولا يمثل الجامعة)</span> في جمعها، لذلك لن تكون دقيقة 100% ولن تمثل كامل الدفعة المقبولة وإنما من استطعنا الوصول إليهم وتطوعوا بتعبئة الاستبيان.</li>
            </ul>
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
          فهمت ✓
        </button>
      </div>
    </div>
  );
}
