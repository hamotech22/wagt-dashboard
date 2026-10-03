import axios from "axios";
import { useEffect, useState } from "react";
import { REPORTS, PERIODS, formatCell } from "./reportDefs";
import { exportCSV, exportPDF } from "./exportUtils";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

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
const primaryBtnCls = "bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium";
const outlineBtnCls = "border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed";

export default function Reports() {
  const [type, setType] = useState("movements");
  const [period, setPeriod] = useState("day");
  const [draft, setDraft] = useState(EMPTY_FILTERS); // القيم أثناء الكتابة
  const [applied, setApplied] = useState(EMPTY_FILTERS); // القيم المطبّقة فعليًا
  const [lookups, setLookups] = useState(null); // null = لسه بيحمل

  const [data, setData] = useState({ columns: [], rows: [] });
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  // جلب قوائم الفلاتر
  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/sites`),
      axios.get(`${API_URL}/gates`),
      axios.get(`${API_URL}/contractors`),
      axios.get(`${API_URL}/projects`),
      axios.get(`${API_URL}/wasteTypes`),
      axios.get(`${API_URL}/transactionStatuses`),
    ])
      .then(([sites, gates, contractors, projects, wasteTypes, statuses]) =>
        setLookups({
          sites: sites.data,
          gates: gates.data,
          contractors: contractors.data,
          projects: projects.data,
          wasteTypes: wasteTypes.data,
          statuses: statuses.data,
        }),
      )
      .catch(() => setLookups({ sites: [], gates: [], contractors: [], projects: [], wasteTypes: [], statuses: [] }));
  }, []);

  // جلب التقرير عند تغيير النوع أو الفترة أو تطبيق الفلاتر
  useEffect(() => {
    setLoading(true);
    setSort({ key: null, dir: "asc" });
    axios
      .get(`${API_URL}/reportsData`, { params: { type, period, ...applied } })
      .then((res) => setData(res.data))
      .catch(() => setData({ columns: [], rows: [] }))
      .finally(() => setLoading(false));
  }, [type, applied, period]);

  const setFilter = (key, value) => setDraft({ ...draft, [key]: value });

  const resetFilters = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
  };

  // الترتيب
  const toggleSort = (key) => {
    if (sort.key === key) {
      setSort({ key, dir: sort.dir === "asc" ? "desc" : "asc" });
    } else {
      setSort({ key, dir: "asc" });
    }
  };

  let rows = data.rows;
  if (sort.key) {
    rows = [...data.rows].sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      if (x == null) return 1;
      if (y == null) return -1;
      return typeof x === "number" ? x - y : String(x).localeCompare(String(y), "ar");
    });
    if (sort.dir === "desc") rows.reverse();
  }

  // الإجماليات
  const totalColumns = data.columns.filter((c) => c.total);
  const totals = {};
  totalColumns.forEach((c) => {
    totals[c.key] = rows.reduce((sum, r) => sum + (Number(r[c.key]) || 0), 0);
  });

  const report = REPORTS.find((r) => r.key === type);
  const showFilters = type !== "devices" && lookups;

  // قوائم الفلاتر: [المفتاح، العنوان، الخيارات [قيمة، نص]]
  const selects = lookups && [
    ["siteId", "الموقع", lookups.sites.map((s) => [s.id, s.nameAr ?? s.name])],
    ["gateId", "البوابة", lookups.gates.map((g) => [g.id, g.nameAr ?? g.name])],
    ["contractorId", "المقاول", lookups.contractors.map((c) => [c.id, c.name])],
    ["projectId", "المشروع", lookups.projects.map((p) => [p.id, p.name])],
    ["waste", "نوع النفايات", lookups.wasteTypes.map((w) => [w.code, w.name])],
    ["status", "حالة العملية", lookups.statuses.map((s) => [s.value, s.label])],
  ];

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Current>التقارير</Breadcrumb.Current>
      </Breadcrumb>

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

      {/* الفلاتر */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <label className="text-xs text-gray-500">
              من تاريخ
              <input type="date" className={inputCls} value={draft.from} onChange={(e) => setFilter("from", e.target.value)} />
            </label>

            <label className="text-xs text-gray-500">
              إلى تاريخ
              <input type="date" className={inputCls} value={draft.to} onChange={(e) => setFilter("to", e.target.value)} />
            </label>

            {selects.map(([key, label, options]) => (
              <label key={key} className="text-xs text-gray-500">
                {label}
                <select className={inputCls} value={draft[key]} onChange={(e) => setFilter(key, e.target.value)}>
                  <option value="">الكل</option>
                  {options.map(([value, text]) => (
                    <option key={value} value={value}>
                      {text}
                    </option>
                  ))}
                </select>
              </label>
            ))}

            <label className="text-xs text-gray-500 md:col-span-2">
              رقم اللوحة
              <input
                className={inputCls}
                placeholder="مثال: 1234"
                value={draft.plate}
                onChange={(e) => setFilter("plate", e.target.value)}
              />
            </label>

            {type === "byPeriod" && (
              <div className="text-xs text-gray-500 md:col-span-2">
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
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setApplied(draft)} className={primaryBtnCls}>
              عرض التقرير
            </button>
            <button onClick={resetFilters} className="border px-5 py-2 rounded-lg text-sm hover:bg-gray-50">
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
              className={outlineBtnCls}
            >
              ⬇ Excel / CSV
            </button>
            <button disabled={loading || rows.length === 0} onClick={exportPDF} className={outlineBtnCls}>
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

            {!loading && rows.length > 0 && totalColumns.length > 0 && (
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