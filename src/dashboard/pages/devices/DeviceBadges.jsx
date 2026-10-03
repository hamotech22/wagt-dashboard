const STATUS = {
  active: { label: "نشط", cls: "bg-green-100 text-green-700" },
  inactive: { label: "غير نشط", cls: "bg-gray-200 text-gray-600" },
  maintenance: { label: "صيانة", cls: "bg-yellow-100 text-yellow-700" },
};

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.inactive;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

export function ConnectionBadge({ status }) {
  const online = status === "online";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`w-2 h-2 rounded-full ${online ? "bg-green-500" : "bg-red-500"}`} />
      <span className={online ? "text-green-700" : "text-red-600"}>{online ? "متصل" : "غير متصل"}</span>
    </span>
  );
}

export const TYPE_LABEL = {
  anpr: "كاميرا ANPR",
  camera: "كاميرا المركبة",
  scale: "ميزان",
  controller: "متحكم البوابة",
  sensor: "حساس",
  access: "تحكم دخول",
};

export const TYPE_ICON = {
  anpr: "📷",
  camera: "🎥",
  scale: "⚖️",
  controller: "🎛️",
  sensor: "📡",
  access: "🔐",
};

export const formatDate = (d, withTime = true) =>
  d ? new Date(d).toLocaleString("ar-SA", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }) : "-";
