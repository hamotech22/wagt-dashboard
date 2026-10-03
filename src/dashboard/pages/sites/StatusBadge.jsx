const MAP = {
  active: { label: "نشط", cls: "bg-green-100 text-green-700" },
  inactive: { label: "غير نشط", cls: "bg-gray-200 text-gray-600" },
  maintenance: { label: "صيانة", cls: "bg-yellow-100 text-yellow-700" },
};

export default function StatusBadge({ status }) {
  const s = MAP[status] || MAP.inactive;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}
