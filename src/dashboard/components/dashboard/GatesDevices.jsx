import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import DoorFrontIcon from "@mui/icons-material/DoorFront";
import DevicesIcon from "@mui/icons-material/Devices";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import WarningIcon from "@mui/icons-material/Warning";
import SearchIcon from "@mui/icons-material/Search";

import DataTable from "react-data-table-component";
import DashboardPagination from "./DashboardPagination";

const TYPE_LABELS = { gate: "بوابة", device: "جهاز" };

const columns = [
  {
    name: "البوابة / الجهاز",
    selector: (row) => row.name,
    sortable: true,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {row.type === "gate" ? <DoorFrontIcon sx={{ fontSize: 15 }} /> : <DevicesIcon sx={{ fontSize: 15 }} />}
        </div>
        <span className="truncate font-medium text-slate-600 dark:text-slate-300">{row.name}</span>
      </div>
    ),
  },
  {
    name: "النوع",
    selector: (row) => TYPE_LABELS[row.type] ?? row.type,
    sortable: true,
  },
  {
    name: "الموقع",
    selector: (row) => row.location,
    sortable: true,
    cell: (row) => <span className="truncate text-sm text-slate-500 dark:text-slate-400">{row.location}</span>,
  },
  {
    name: "الحالة",
    selector: (row) => row.status,
    sortable: true,
    cell: (row) => (
      <span className={`flex items-center gap-1 whitespace-nowrap text-sm font-medium ${row.online ? "text-emerald-500" : "text-red-500"}`}>
        {row.online ? <SignalCellularAltIcon sx={{ fontSize: 16 }} /> : <WarningIcon sx={{ fontSize: 16 }} />}
        {row.status}
      </span>
    ),
  },
];

// Tailwind-matched styles for react-data-table-component
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

export default function GatesDevices() {
  const [items, setItems] = useState([]);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3000/gatesDevices")
      .then((response) => {
        setItems(response?.data ?? []);
      })
      .catch(() => setItems([]));
  }, []);

  const gates = items.filter((item) => item.type === "gate");
  const devices = items.filter((item) => item.type === "device");
  const gatesOnline = gates.filter((item) => item.online).length;
  const gatesOffline = gates.filter((item) => !item.online).length;
  const devicesOnline = devices.filter((item) => item.online).length;
  const devicesOffline = devices.filter((item) => !item.online).length;

  const filteredItems = useMemo(() => {
    if (!filterText.trim()) return items;
    const term = filterText.trim().toLowerCase();
    return items.filter((item) =>
      [item.name, item.location, item.status, TYPE_LABELS[item.type]]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [items, filterText]);

  return (
    <div className="h-full w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 dark:border-slate-700 dark:bg-slate-800" dir="rtl">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">حالة البوابات والأجهزة</h2>
      </div>

      {/* Summary Cards */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="min-w-0 rounded-lg border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              <DoorFrontIcon sx={{ fontSize: 19 }} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-400 dark:text-slate-400">البوابات</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{gates.length}</p>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm">
            <span className="flex items-center gap-1 whitespace-nowrap text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              {gatesOnline} عاملة
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
              {gatesOffline} متوقفة
            </span>
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              <DevicesIcon sx={{ fontSize: 19 }} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-400 dark:text-slate-400">الأجهزة</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{devices.length}</p>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm">
            <span className="flex items-center gap-1 whitespace-nowrap text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              {devicesOnline} متصلة
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
              {devicesOffline} غير متصلة
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-2 w-full sm:w-56">
        <SearchIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
        <input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="بحث..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-9 pl-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:focus:bg-slate-900"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-100 dark:border-slate-700">
        <div className="overflow-x-auto">
          <div className="min-w-[480px]">
            <DataTable
              columns={columns}
              data={filteredItems}
              customStyles={customStyles}
              pagination
              paginationComponent={DashboardPagination}
              paginationPerPage={5}
              paginationRowsPerPageOptions={[5, 10, 25]}
              paginationComponentOptions={paginationLabels}
              noDataComponent={
                <div className="w-full bg-white py-8 text-center text-sm text-slate-400 dark:bg-slate-800 dark:text-slate-300">
                  لا توجد بيانات
                </div>
              }
              highlightOnHover
              persistTableHead
            />
          </div>
        </div>
      </div>
    </div>
  );
}
