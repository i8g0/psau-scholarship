"use client";

interface EmptyStateProps {
  loading: boolean;
}

export function EmptyState({ loading }: EmptyStateProps) {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="text-5xl mb-4">{loading ? "⏳" : "📭"}</div>
      <div className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>
        {loading ? "جاري تحميل البيانات..." : "لا توجد نتائج مطابقة للبحث"}
      </div>
      {!loading && (
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          جرّب تغيير الفلاتر أو مصطلح البحث
        </p>
      )}
    </div>
  );
}