import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { REPORTS, PERIODS, formatCell } from "./reportDefs";
import { exportCSV, exportPDF } from "./exportUtils";

const API_URL = "http://localhost:3000";

const fetchReportLookups = () =>
  axios
    .all([
      axios.get(`${API_URL}/sites`),
      axios.get(`${API_URL}/gates`),
      axios.get(`${API_URL}/contractors`),
      axios.get(`${API_URL}/projects`),
      axios.get(`${API_URL}/wasteTypes`),
      axios.get(`${API_URL}/transactionStatuses`),
    ])
    .then(([sitesRes, gatesRes, contractorsRes, projectsRes, wasteRes, statusesRes]) => ({
      sites: sitesRes?.data ?? [],
      gates: gatesRes?.data ?? [],
      contractors: contractorsRes?.data ?? [],
      projects: projectsRes?.data ?? [],
      wasteTypes: wasteRes?.data ?? [],
      statuses: statusesRes?.data ?? [],
    }))
    .catch(() => ({ sites: [], gates: [], contractors: [], projects: [], wasteTypes: [], statuses: [] }));

const fetchReport = (type, filters, period) =>
  axios
    .get(`${API_URL}/reportsData`, { params: { type, period, ...filters } })
    .then((response) => response.data)
    .catch(() => ({ columns: [], rows: [] }));

const EMPTY_FILTERS = {
  from: "",
  to: "",
  siteId: "",
  gateId: "",
  contractorId: "",
  projectId: "",
  waste: "",
  status: "",
  plate: "",
};

const inputCls = "border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function Reports() {
  const [type, setType] = useState("movements");
  const [period, setPeriod] = useState("day");
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [lookups, setLookups] = useState(null);

  const [data, setData] = useState({ columns: [], rows: [] });
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  useEffect(() => {
    fetchReportLookups().then(setLookups);
  }, []);

  // View: يُجلب التقرير عند تغيير النوع أو الفترة أو تطبيق الفلاتر
  useEffect(() => {
    setLoading(true);
    setSort({ key: null, dir: "asc" });
    fetchReport(type, applied, period).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [type, applied, period]);

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const reset = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
  };

  // Sort
  const rows = useMemo(() => {
    if (!sort.key) return data.rows;
    const sorted = [...data.rows].sort((a, b) => {
      const x = a[sort.key],
        y = b[sort.key];
      if (x == null) return 1;
      if (y == null) return -1;
      return typeof x === "number" ? x - y : String(x).localeCompare(String(y), "ar");
    });
    return sort.dir === "asc" ? sorted : sorted.reverse();
  }, [data.rows, sort]);

  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  // الإجماليات
  const totals = useMemo(() => {
    const t = {};
    data.columns
      .filter((c) => c.total)
      .forEach((c) => {
        t[c.key] = rows.reduce((s, r) => s + (Number(r[c.key]) || 0), 0);
      });
    return t;
  }, [rows, data.columns]);
  const hasTotals = Object.keys(totals).length > 0;

  const report = REPORTS.find((r) => r.key === type);
  const showFilters = type !== "devices";

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">التقارير</h1>
        <p className="text-sm text-gray-500">اختر التقرير، حدّد الفلاتر، ثم اعرضه أو صدّره</p>
      </div>

      {/* اختيار التقرير */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
        {REPORTS.map((r) => (
          <button
            key={r.key}
            onClick={() => setType(r.key)}
            className={`text-right p-3 rounded-xl border transition ${
              type === r.key ? "bg-blue-600 text-white border-blue-600 shadow" : "bg-white hover:bg-gray-50"
            }`}
          >
            <div className="text-xl">{r.icon}</div>
            <div className="text-sm font-semibold mt-1">{r.title}</div>
            <div className={`text-xs mt-0.5 ${type === r.key ? "text-blue-100" : "text-gray-400"}`}>{r.desc}</div>
          </button>
        ))}
      </div>

      {/* Filter */}
      {showFilters && lookups && (
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <label className="text-xs text-gray-500">
              من تاريخ
              <input type="date" className={inputCls} value={draft.from} onChange={(e) => set("from", e.target.value)} />
            </label>
            <label className="text-xs text-gray-500">
              إلى تاريخ
              <input type="date" className={inputCls} value={draft.to} onChange={(e) => set("to", e.target.value)} />
            </label>
            <label className="text-xs text-gray-500">
              الموقع
              <select className={inputCls} value={draft.siteId} onChange={(e) => set("siteId", e.target.value)}>
                <option value="">الكل</option>
                {lookups.sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-gray-500">
              البوابة
              <select className={inputCls} value={draft.gateId} onChange={(e) => set("gateId", e.target.value)}>
                <option value="">الكل</option>
                {lookups.gates.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-gray-500">
              المقاول
              <select className={inputCls} value={draft.contractorId} onChange={(e) => set("contractorId", e.target.value)}>
                <option value="">الكل</option>
                {lookups.contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-gray-500">
              المشروع
              <select className={inputCls} value={draft.projectId} onChange={(e) => set("projectId", e.target.value)}>
                <option value="">الكل</option>
                {lookups.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-gray-500">
              نوع النفايات
              <select className={inputCls} value={draft.waste} onChange={(e) => set("waste", e.target.value)}>
                <option value="">الكل</option>
                {lookups.wasteTypes.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-gray-500">
              حالة العملية
              <select className={inputCls} value={draft.status} onChange={(e) => set("status", e.target.value)}>
                <option value="">الكل</option>
                {lookups.statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-gray-500 md:col-span-2">
              رقم اللوحة
              <input className={inputCls} placeholder="مثال: 1234" value={draft.plate} onChange={(e) => set("plate", e.target.value)} />
            </label>
            {type === "byPeriod" && (
              <label className="text-xs text-gray-500 md:col-span-2">
                نوع الفترة
                <div className="flex gap-2 mt-1">
                  {PERIODS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPeriod(p.value)}
                      className={`flex-1 py-2 rounded-lg text-sm border ${
                        period === p.value ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </label>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setApplied(draft)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm">
              عرض التقرير
            </button>
            <button onClick={reset} className="border px-5 py-2 rounded-lg text-sm hover:bg-gray-50">
              مسح الفلاتر
            </button>
          </div>
        </div>
      )}

      {/* النتيجة */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold text-gray-800">
              {report.icon} {report.title}
            </h2>
            <p className="text-xs text-gray-400">
              {loading ? "جارِ التحميل..." : `${rows.length} سجل`}
              <span className="hidden print:inline"> — {new Date().toLocaleDateString("ar-SA")}</span>
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              disabled={loading || rows.length === 0}
              onClick={() => exportCSV(report.key, data.columns, rows)}
              className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40"
            >
              ⬇ Excel / CSV
            </button>
            <button
              disabled={loading || rows.length === 0}
              onClick={exportPDF}
              className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40"
            >
              🖨 PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {data.columns.map((c) => (
                  <th
                    key={c.key}
                    onClick={() => toggleSort(c.key)}
                    className="p-3 whitespace-nowrap cursor-pointer select-none hover:text-blue-600"
                  >
                    {c.label}
                    <span className="text-xs mr-1 text-gray-400 print:hidden">
                      {sort.key === c.key ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={data.columns.length || 1} className="p-8 text-center text-gray-400">
                    جارِ التحميل...
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={data.columns.length || 1} className="p-8 text-center text-gray-400">
                    لا توجد بيانات مطابقة للفلاتر
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    {data.columns.map((c) => (
                      <td key={c.key} className="p-3 whitespace-nowrap">
                        {formatCell(c, r[c.key])}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
            {!loading && rows.length > 0 && hasTotals && (
              <tfoot className="bg-gray-50 font-semibold text-gray-800">
                <tr className="border-t-2">
                  {data.columns.map((c, i) => (
                    <td key={c.key} className="p-3">
                      {i === 0 ? "الإجمالي" : c.total ? formatCell(c, totals[c.key]) : ""}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
