const STATUS = {
  active: { label: "نشطة", cls: "bg-green-100 text-green-700" },
  pending: { label: "بانتظار المراجعة", cls: "bg-orange-100 text-orange-700" },
  suspended: { label: "موقوفة", cls: "bg-red-100 text-red-700" },
  inactive: { label: "غير نشطة", cls: "bg-gray-200 text-gray-600" },
};

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.inactive;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

export const SOURCE_LABEL = {
  manual: "إدخال يدوي",
  anpr: "اكتشاف ANPR",
  import: "استيراد",
};

export function SourceBadge({ source }) {
  const cls = source === "anpr" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-600";
  return <span className={`px-2 py-0.5 rounded text-xs ${cls}`}>{SOURCE_LABEL[source] || source}</span>;
}

// شكل لوحة مركبة: الأرقام + الحروف
export function PlateBadge({ number, chars, size = "md" }) {
  const big = size === "lg";
  return (
    <span
      dir="ltr"
      className={`inline-flex items-center border-2 border-gray-800 rounded-md bg-white font-bold tracking-widest text-gray-900 ${
        big ? "px-4 py-2 text-2xl gap-3" : "px-2 py-0.5 text-sm gap-2"
      }`}
    >
      <span>{number}</span>
      <span className="w-px self-stretch bg-gray-400" />
      <span dir="rtl">{chars}</span>
    </span>
  );
}

export const TX_STATUS = {
  synced: { label: "تمت المزامنة", cls: "bg-green-100 text-green-700" },
  pending: { label: "بانتظار الإرسال", cls: "bg-yellow-100 text-yellow-700" },
  failed: { label: "فشل", cls: "bg-red-100 text-red-700" },
};

export const formatDate = (d, withTime = true) =>
  d
    ? new Date(d).toLocaleString("ar-SA", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" })
    : "-";
