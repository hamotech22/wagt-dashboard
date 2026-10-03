import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge, PlateBadge, STATUS_OPTIONS, txCode, tons, formatDate, isToday } from "./TransactionBadges";

const API_URL = "http://localhost:3000";

const fetchTransactions = () =>
  axios
    .get(`${API_URL}/transactions`)
    .then((response) =>
      (Array.isArray(response.data) ? response.data : []).map((transaction) => ({
        ...transaction,
        plateNumber: transaction.plateNumber ?? transaction.vehicle?.num ?? "",
        plateChars: transaction.plateChars ?? transaction.vehicle?.chars ?? "",
        wasteWeight:
          transaction.wasteWeight ??
          (transaction.inWeight != null && transaction.outWeight != null
            ? Math.abs(transaction.inWeight - transaction.outWeight)
            : null),
      })),
    )
    .catch(() => []);
const fetchTransactionLookups = () =>
  axios
    .all([
      axios.get(`${API_URL}/sites`),
      axios.get(`${API_URL}/gates`),
      axios.get(`${API_URL}/contractors`),
      axios.get(`${API_URL}/wasteTypesRef`),
    ])
    .then(([sitesRes, gatesRes, contractorsRes, wasteRes]) => ({
      sites: sitesRes?.data ?? [],
      gates: gatesRes?.data ?? [],
      contractors: contractorsRes?.data ?? [],
      wasteTypes: wasteRes?.data ?? [],
    }))
    .catch(() => ({ sites: [], gates: [], contractors: [], wasteTypes: [] }));

function StatCard({ label, value, unit, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>
        {value} {unit && <span className="text-sm font-normal text-gray-400">{unit}</span>}
      </div>
    </div>
  );
}

/**
 * جدول مشترك للعمليات
 * mode: "all" | "entry" | "exit"
 */
export default function TransactionsTable({ mode = "all", title, subtitle }) {
  const [rows, setRows] = useState([]);
  const [lookups, setLookups] = useState({ sites: [], gates: [], contractors: [], wasteTypes: [] });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [siteId, setSiteId] = useState("");
  const [contractorId, setContractorId] = useState("");
  const [waste, setWaste] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    Promise.all([fetchTransactions(), fetchTransactionLookups()]).then(([t, l]) => {
      setRows(t);
      setLookups(l);
      setLoading(false);
    });
  }, []);

  // تاريخ الفلترة: الخروج في صفحة الخروج، وإلا الدخول
  const dateOf = (t) => (mode === "exit" ? t.exitAt : t.entryAt);

  const filtered = useMemo(() => {
    const q = search.replace(/\s/g, "").toLowerCase();
    return rows
      .filter((t) => (mode === "exit" ? !!t.exitAt : true))
      .filter((t) => {
        const d = dateOf(t) ? new Date(dateOf(t)) : null;
        return (
          (!q ||
            (String(t.plateNumber ?? "") + String(t.plateChars ?? "").replace(/\s/g, "")).includes(q) ||
            txCode(t.id).toLowerCase().includes(q)) &&
          (!from || (d && d >= new Date(from))) &&
          (!to || (d && d <= new Date(to + "T23:59:59"))) &&
          (!siteId || t.siteId === Number(siteId)) &&
          (!contractorId || t.contractorId === Number(contractorId)) &&
          (!waste || t.wasteTypeCode === Number(waste)) &&
          (!status || t.status === status)
        );
      })
      .sort((a, b) => new Date(dateOf(b)) - new Date(dateOf(a)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, from, to, siteId, contractorId, waste, status, mode]);

  const name = (list, id, key = "id") => list.find((x) => String(x[key]) === String(id))?.name || "-";

  // إحصائيات اليوم
  const stats = useMemo(
    () => ({
      entered: rows.filter((t) => isToday(t.entryAt) && t.status !== "rejected").length,
      exited: rows.filter((t) => isToday(t.exitAt)).length,
      inside: rows.filter((t) => t.status === "inside").length,
      waste: rows.filter((t) => isToday(t.exitAt) && t.status === "completed").reduce((s, t) => s + (t.wasteWeight || 0), 0),
    }),
    [rows],
  );

  // تعريف الأعمدة حسب الوضع
  const P = (t) => <PlateBadge number={t.plateNumber} chars={t.plateChars} />;
  const code = (t) => (
    <Link to={`/dashboard/transactions/${t.id}`} className="font-mono text-xs text-blue-600 hover:underline" dir="ltr">
      {txCode(t.id)}
    </Link>
  );

  const COLUMNS = {
    all: [
      ["رقم العملية", code],
      ["اللوحة", P],
      ["المقاول", (t) => name(lookups.contractors, t.contractorId)],
      ["الموقع", (t) => name(lookups.sites, t.siteId)],
      ["نوع النفايات", (t) => name(lookups.wasteTypes, t.wasteTypeCode, "code")],
      ["وقت الدخول", (t) => <span className="text-xs">{formatDate(t.entryAt)}</span>],
      ["وقت الخروج", (t) => <span className="text-xs">{formatDate(t.exitAt)}</span>],
      ["صافي النفايات (طن)", (t) => <b>{tons(t.wasteWeight)}</b>],
      ["الحالة", (t) => <StatusBadge status={t.status} />],
    ],
    entry: [
      ["رقم العملية", code],
      ["اللوحة", P],
      ["المقاول", (t) => name(lookups.contractors, t.contractorId)],
      ["بوابة الدخول", (t) => name(lookups.gates, t.entryGateId)],
      ["السائق", (t) => t.driverName || "-"],
      ["وقت الدخول", (t) => <span className="text-xs">{formatDate(t.entryAt)}</span>],
      ["وزن الدخول (طن)", (t) => <b>{tons(t.inWeight)}</b>],
      ["الحالة", (t) => <StatusBadge status={t.status} />],
    ],
    exit: [
      ["رقم العملية", code],
      ["اللوحة", P],
      ["المقاول", (t) => name(lookups.contractors, t.contractorId)],
      ["بوابة الخروج", (t) => name(lookups.gates, t.exitGateId)],
      ["وقت الخروج", (t) => <span className="text-xs">{formatDate(t.exitAt)}</span>],
      ["وزن الخروج (طن)", (t) => tons(t.outWeight)],
      ["صافي النفايات (طن)", (t) => <b>{tons(t.wasteWeight)}</b>],
      ["الحالة", (t) => <StatusBadge status={t.status} />],
    ],
  };
  const cols = COLUMNS[mode];

  const inputCls = "border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      {mode === "all" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="الداخلة اليوم" value={stats.entered} color="text-blue-600" />
          <StatCard label="الخارجة اليوم" value={stats.exited} color="text-green-600" />
          <StatCard label="داخل الموقع الآن" value={stats.inside} color="text-orange-600" />
          <StatCard label="نفايات اليوم" value={tons(stats.waste)} unit="طن" color="text-gray-800" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث برقم اللوحة أو رقم العملية..."
          className={`${inputCls} md:col-span-2`}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">من</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={`${inputCls} w-full`} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">إلى</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={`${inputCls} w-full`} />
        </div>
        <select value={siteId} onChange={(e) => setSiteId(e.target.value)} className={inputCls}>
          <option value="">كل المواقع</option>
          {lookups.sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select value={contractorId} onChange={(e) => setContractorId(e.target.value)} className={inputCls}>
          <option value="">كل المقاولين</option>
          {lookups.contractors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={waste} onChange={(e) => setWaste(e.target.value)} className={inputCls}>
          <option value="">كل أنواع النفايات</option>
          {lookups.wasteTypes.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
          <option value="">كل الحالات</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {cols.map(([h]) => (
                <th key={h} className="p-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={cols.length + 1} className="p-8 text-center text-gray-400">
                  جارِ التحميل...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={cols.length + 1} className="p-8 text-center text-gray-400">
                  لا توجد عمليات
                </td>
              </tr>
            )}
            {filtered.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                {cols.map(([h, render]) => (
                  <td key={h} className="p-3">
                    {render(t)}
                  </td>
                ))}
                <td className="p-3">
                  <Link to={`/dashboard/transactions/${t.id}`} className="text-blue-600 hover:underline text-xs">
                    عرض
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && <div className="px-4 py-2 border-t text-xs text-gray-400">{filtered.length} عملية</div>}
      </div>
    </div>
  );
}
