export const SCOPE_LEVELS = [
  { value: "platform", label: "المنصة", hint: "كامل المنصة" },
  { value: "municipality", label: "البلدية", hint: "البلدية", source: "municipalities" },
  { value: "project", label: "المشروع", hint: "المشروع", source: "projects" },
  { value: "gate", label: "البوابة", hint: "البوابة", source: "gates" },
  { value: "contractor", label: "المقاول", hint: "المقاول", source: "contractors" },
  { value: "site", label: "الموقع", hint: "الموقع", source: "sites" },
];

const STATUS = {
  active: { label: "نشط", cls: "bg-green-100 text-green-700" },
  inactive: { label: "غير نشط", cls: "bg-gray-200 text-gray-600" },
  locked: { label: "مقفل", cls: "bg-red-100 text-red-700" },
};

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.inactive;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

export function MfaBadge({ enabled }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`w-2 h-2 rounded-full ${enabled ? "bg-green-500" : "bg-gray-400"}`} />
      <span className={enabled ? "text-green-700" : "text-gray-500"}>{enabled ? "مفعّلة" : "غير مفعّلة"}</span>
    </span>
  );
}

export function Avatar({ name = "", size = "w-9 h-9 text-sm" }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join(" ");
  return (
    <span className={`${size} rounded-full bg-blue-100 text-blue-700 font-semibold inline-flex items-center justify-center shrink-0`}>
      {initials || "؟"}
    </span>
  );
}

export const STATUS_OPTIONS = [
  { value: "active", label: "نشط" },
  { value: "inactive", label: "غير نشط" },
  { value: "locked", label: "مقفل" },
];

export const formatDate = (d, withTime = true) =>
  d ? new Date(d).toLocaleString("ar-SA", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }) : "-";

export const scopeLabel = (level) => SCOPE_LEVELS.find((l) => l.value === level)?.label || "-";

// نص مختصر لنطاق بيانات المستخدم: "مشروع: مشروع نظافة نجران، ..."
export function scopeText(user, lookups) {
  const lvl = SCOPE_LEVELS.find((l) => l.value === user.scopeLevel);
  if (!lvl) return "-";
  if (!lvl.source) return lvl.hint;
  const list = lookups?.[lvl.source] || [];
  const names = (user.scopeIds || [])
    .map((id) => {
      const item = list.find((entry) => String(entry.id) === String(id));
      return item?.nameAr || item?.name;
    })
    .filter(Boolean);
  return names.length ? `${lvl.label}: ${names.join("، ")}` : lvl.label;
}

// عدد الصلاحيات الممنوحة لدور (للعرض فقط)
export const countPerms = (role) => Object.values(role?.permissions || {}).reduce((sum, arr) => sum + arr.length, 0);
