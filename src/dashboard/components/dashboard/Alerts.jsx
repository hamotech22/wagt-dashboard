import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";

import DataTable from "react-data-table-component";
import DashboardPagination from "./DashboardPagination";

const ALERT_STYLES = {
  error: {
    icon: <ErrorIcon sx={{ fontSize: 17 }} />,
    iconColor: "text-red-500 dark:text-red-400",
    iconBg: "bg-red-100 dark:bg-red-500/10",
  },
  warning: {
    icon: <WarningIcon sx={{ fontSize: 17 }} />,
    iconColor: "text-orange-500 dark:text-orange-400",
    iconBg: "bg-orange-100 dark:bg-orange-500/10",
  },
  info: {
    icon: <InfoIcon sx={{ fontSize: 17 }} />,
    iconColor: "text-blue-500 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-500/10",
  },
  success: {
    icon: <CheckCircleIcon sx={{ fontSize: 17 }} />,
    iconColor: "text-emerald-500 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/10",
  },
};

const columns = [
  {
    name: "التنبيه",
    selector: (row) => row.title,
    sortable: true,
    grow: 3,
    cell: (row) => (
      <div className="flex items-center gap-3 py-1">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ALERT_STYLES[row.type]?.iconBg ?? "bg-slate-100"} ${ALERT_STYLES[row.type]?.iconColor ?? "text-slate-500"}`}>
          {ALERT_STYLES[row.type]?.icon ?? <InfoIcon sx={{ fontSize: 17 }} />}
        </div>
        <span className="truncate text-sm font-medium text-slate-600 dark:text-slate-300">{row.title}</span>
      </div>
    ),
  },
  {
    name: "الوقت",
    selector: (row) => row.time,
    sortable: true,
    cell: (row) =>     <span className="text-sm text-slate-400 dark:text-slate-400">{row.time}</span>,
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
  noData: { style: { padding: 0, backgroundColor: "transparent", color: "#94a3b8", fontSize: "0.875rem" } },
  pagination: { style: { direction: "rtl", borderTopWidth: "1px", borderTopColor: "#f1f5f9" } },
};

const paginationLabels = {
  rowsPerPageText: "نتيجة لكل صفحة",
  rangeSeparatorText: "من",
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3000/alerts")
      .then((response) => {
        if (!Array.isArray(response.data)) {
          throw new Error("Alerts API returned an invalid response.");
        }
        setAlerts(response.data);
      })
      .catch((error) => {
        console.error("Failed to load dashboard alerts:", error);
        setLoadError(true);
      });
  }, []);

  const filteredAlerts = useMemo(() => {
    if (!filterText.trim()) return alerts;
    const term = filterText.trim().toLowerCase();
    return alerts.filter((alert) => alert.title.toLowerCase().includes(term));
  }, [alerts, filterText]);

  return (
    <div className="h-full w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800" dir="rtl">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">التنبيهات</h2>

        <div className="relative w-full sm:w-56">
          <SearchIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
          <input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="بحث..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-9 pl-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:focus:bg-slate-900"
          />
        </div>
      </div>

      {/* DataTable (built-in pagination) */}
      <div className="overflow-hidden rounded-lg border border-slate-100 dark:border-slate-700">
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredAlerts}
            customStyles={customStyles}
            pagination
            paginationComponent={DashboardPagination}
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10, 25]}
            paginationComponentOptions={paginationLabels}
            noDataComponent={
              <div className="w-full bg-white py-8 text-center text-sm text-slate-400 dark:bg-slate-800 dark:text-slate-300">
                {loadError ? "تعذر تحميل التنبيهات." : "لا توجد تنبيهات"}
              </div>
            }
            highlightOnHover
            persistTableHead
          />
        </div>
      </div>
    </div>
  );
}
