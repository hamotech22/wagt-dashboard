import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SearchIcon from "@mui/icons-material/Search";

import DataTable from "react-data-table-component";

const STATUS_STYLES = {
  مكتملة: "bg-emerald-100 text-emerald-600",
  معلقة: "bg-amber-100 text-amber-600",
  "قيد التنفيذ": "bg-blue-100 text-blue-600",
};

const statusClass = (status) => STATUS_STYLES[status] ?? "bg-red-100 text-red-600";

const columns = [
  {
    name: "رقم المركبة",
    selector: (row) => row.vehicle,
    sortable: true,
    cell: (row) => <span className="font-semibold text-slate-700">{row.vehicle}</span>,
  },
  {
    name: "المقاول",
    selector: (row) => row.contractor,
    sortable: true,
    cell: (row) => <span className="text-sm text-slate-600">{row.contractor}</span>,
  },
  {
    name: "المشروع",
    selector: (row) => row.project,
    sortable: true,
    cell: (row) => <span className="text-sm text-slate-600">{row.project}</span>,
  },
  {
    name: "الموقع",
    selector: (row) => row.location,
    sortable: true,
    cell: (row) => <span className="text-sm text-slate-600">{row.location}</span>,
  },
  {
    name: "الوزن",
    selector: (row) => row.weight,
    sortable: true,
    cell: (row) => <span className="text-sm font-semibold text-slate-700">{row.weight} طن</span>,
  },
  {
    name: "الوقت",
    selector: (row) => row.time,
    sortable: true,
    cell: (row) => <span className="text-sm text-slate-500">{row.time}</span>,
  },
  {
    name: "الحالة",
    selector: (row) => row.status,
    sortable: true,
    cell: (row) => (
      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusClass(row.status)}`}>{row.status}</span>
    ),
  },
];

// Tailwind-matched styles for react-data-table-component (it doesn't read Tailwind classes on its own wrappers)
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

export default function RecentOperations() {
  const [operations, setOperations] = useState([]);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3000/operations")
      .then((response) => {
        setOperations(response?.data ?? []);
      })
      .catch(() => setOperations([]));
  }, []);

  const filteredOperations = useMemo(() => {
    if (!filterText.trim()) return operations;
    const term = filterText.trim().toLowerCase();
    return operations.filter((op) =>
      [op.vehicle, op.contractor, op.project, op.location, op.status]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [operations, filterText]);

  return (
    <div className="h-full w-full rounded-xl border border-slate-200 bg-white shadow-sm" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <DirectionsCarIcon />
          </div>

          <div>
            <h2 className="font-bold text-slate-800">أحدث العمليات</h2>
            <p className="mt-1 text-sm text-slate-400">آخر العمليات المسجلة</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex justify-end px-5 py-4">
        <div className="relative w-full sm:w-56">
          <SearchIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
          <input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="بحث..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-9 pl-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
          />
        </div>
      </div>

      {/* DataTable (built-in pagination) */}
      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={filteredOperations}
          customStyles={customStyles}
          pagination
          paginationPerPage={5}
          paginationRowsPerPageOptions={[5, 10, 25]}
          paginationComponentOptions={paginationLabels}
          noDataComponent="لا توجد نتائج مطابقة"
          highlightOnHover
          persistTableHead
        />
      </div>
    </div>
  );
}
