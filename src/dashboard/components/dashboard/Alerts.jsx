import { useMemo, useState } from "react";

import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";

import DataTable from "react-data-table-component";

const ALERTS = [
  {
    id: 1,
    title: "انخفاض مستوى الاتصال بجهاز الوزن في الموقع 2",
    time: "منذ 15 دقيقة",
    icon: <ErrorIcon sx={{ fontSize: 17 }} />,
    iconColor: "text-red-500",
    iconBg: "bg-red-100",
  },
  {
    id: 2,
    title: "تم تسجيل عملية دخول غير مصرح بها",
    time: "منذ 30 دقيقة",
    icon: <WarningIcon sx={{ fontSize: 17 }} />,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-100",
  },
  {
    id: 3,
    title: "تم استلام بيانات جديدة من منصة مدينتي",
    time: "منذ ساعة",
    icon: <InfoIcon sx={{ fontSize: 17 }} />,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-100",
  },
  {
    id: 4,
    title: "مباينة مكتملة بنجاح",
    time: "منذ 3 ساعات",
    icon: <CheckCircleIcon sx={{ fontSize: 17 }} />,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-100",
  },
];

const columns = [
  {
    name: "التنبيه",
    selector: (row) => row.title,
    sortable: true,
    grow: 3,
    cell: (row) => (
      <div className="flex items-center gap-3 py-1">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${row.iconBg} ${row.iconColor}`}>
          {row.icon}
        </div>
        <span className="truncate text-sm font-medium text-slate-600">{row.title}</span>
      </div>
    ),
  },
  {
    name: "الوقت",
    selector: (row) => row.time,
    sortable: true,
    cell: (row) => <span className="text-sm text-slate-400">{row.time}</span>,
  },
];

// Tailwind-matched styles for react-data-table-component (same values used in RecentOperations / GatesDevices)
const customStyles = {
  table: { style: { direction: "rtl" } },
  headRow: {
    style: { backgroundColor: "#f8fafc", borderBottomWidth: "1px", borderBottomColor: "#f1f5f9", minHeight: "44px" },
  },
  headCells: {
    style: {
      fontSize: "0.875rem",
      fontWeight: 600,
      color: "#64748b",
      paddingTop: "12px",
      paddingBottom: "12px",
      justifyContent: "flex-end",
    },
  },
  rows: {
    style: {
      minHeight: "60px",
      borderBottomWidth: "1px",
      borderBottomColor: "#f1f5f9",
      "&:hover": { backgroundColor: "#f8fafc" },
    },
  },
  cells: { style: { justifyContent: "flex-end", paddingTop: "8px", paddingBottom: "8px" } },
  noData: { style: { padding: "32px", color: "#94a3b8", fontSize: "0.875rem" } },
  pagination: { style: { direction: "rtl", borderTopWidth: "1px", borderTopColor: "#f1f5f9" } },
};

const paginationLabels = {
  rowsPerPageText: "نتيجة لكل صفحة",
  rangeSeparatorText: "من",
};

export default function Alerts() {
  const [filterText, setFilterText] = useState("");

  const filteredAlerts = useMemo(() => {
    if (!filterText.trim()) return ALERTS;
    const term = filterText.trim().toLowerCase();
    return ALERTS.filter((alert) => alert.title.toLowerCase().includes(term));
  }, [filterText]);

  return (
    <div className="h-full w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm" dir="rtl">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-800">التنبيهات</h2>

        <div className="relative w-full sm:w-56">
          <SearchIcon
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            fontSize="small"
          />
          <input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="بحث..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-9 pl-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
          />
        </div>
      </div>

      {/* DataTable (built-in pagination) */}
      <div className="overflow-hidden rounded-lg border border-slate-100">
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredAlerts}
            customStyles={customStyles}
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10, 25]}
            paginationComponentOptions={paginationLabels}
            noDataComponent="لا توجد تنبيهات"
            highlightOnHover
            persistTableHead
          />
        </div>
      </div>
    </div>
  );
}