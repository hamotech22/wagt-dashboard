// تعريف التقارير (Reporting Layer) — بند 43: التقارير لا تُبنى Hard-coded
// لإضافة تقرير جديد: أضفه هنا + أضف منطقه في reportsApi.js

export const REPORTS = [
  { key: "movements", title: "حركة المركبات", desc: "كل عملية دخول وخروج بأوزانها", icon: "🚛" },
  { key: "byWasteType", title: "حسب نوع النفايات", desc: "الكميات لكل نوع", icon: "♻️" },
  { key: "byContractor", title: "حسب المقاول", desc: "أداء وكميات كل مقاول", icon: "👷" },
  { key: "byProject", title: "حسب المشروع", desc: "الكميات لكل مشروع", icon: "📁" },
  { key: "bySite", title: "حسب الموقع", desc: "الكميات لكل مردم", icon: "📍" },
  { key: "byGate", title: "حسب البوابة", desc: "حركة كل بوابة", icon: "🚪" },
  { key: "byPeriod", title: "تقرير دوري", desc: "يومي / أسبوعي / شهري", icon: "📅" },
  { key: "devices", title: "حالة الأجهزة", desc: "اتصال الأجهزة وآخر ظهور", icon: "📡" },
];

// type: text | number | tons | datetime
// total: true → يُجمع في صف الإجمالي
const groupedCols = (label) => [
  { key: "name", label, type: "text" },
  { key: "count", label: "عدد العمليات", type: "number", total: true },
  { key: "vehicles", label: "عدد المركبات", type: "number" },
  { key: "netTons", label: "صافي النفايات (طن)", type: "tons", total: true },
  { key: "avgTons", label: "متوسط الحمولة (طن)", type: "tons" },
];

export const COLUMNS = {
  movements: [
    { key: "code", label: "رقم العملية", type: "text" },
    { key: "plate", label: "اللوحة", type: "text" },
    { key: "contractor", label: "المقاول", type: "text" },
    { key: "site", label: "الموقع", type: "text" },
    { key: "waste", label: "نوع النفايات", type: "text" },
    { key: "entryAt", label: "وقت الدخول", type: "datetime" },
    { key: "exitAt", label: "وقت الخروج", type: "datetime" },
    { key: "inTons", label: "وزن الدخول (طن)", type: "tons", total: true },
    { key: "outTons", label: "وزن الخروج (طن)", type: "tons", total: true },
    { key: "netTons", label: "صافي النفايات (طن)", type: "tons", total: true },
    { key: "status", label: "الحالة", type: "text" },
  ],
  byWasteType: groupedCols("نوع النفايات"),
  byContractor: groupedCols("المقاول"),
  byProject: groupedCols("المشروع"),
  bySite: groupedCols("الموقع"),
  byGate: groupedCols("البوابة"),
  byPeriod: groupedCols("الفترة"),
  devices: [
    { key: "name", label: "الجهاز", type: "text" },
    { key: "type", label: "النوع", type: "text" },
    { key: "gate", label: "البوابة", type: "text" },
    { key: "connection", label: "الاتصال", type: "text" },
    { key: "lastSeen", label: "آخر ظهور", type: "datetime" },
  ],
};

export const PERIODS = [
  { value: "day", label: "يومي" },
  { value: "week", label: "أسبوعي" },
  { value: "month", label: "شهري" },
];

export const STATUS_LABEL = {
  inside: "داخل الموقع",
  completed: "مكتملة",
  rejected: "مرفوضة",
  cancelled: "ملغاة",
};

// تنسيق الخلية (للعرض والتصدير)
export function formatCell(col, value) {
  if (value == null || value === "") return "-";
  if (col.type === "tons") return Number(value).toFixed(2);
  if (col.type === "number") return String(value);
  if (col.type === "datetime")
    return new Date(value).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" });
  return String(value);
}
