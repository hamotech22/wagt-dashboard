import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge, PlateBadge, STATUS_OPTIONS, txCode, tons, formatDate, isToday, getTransactionPlate, getWasteWeight } from "./TransactionBadges";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

const inputCls = "border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const actionBtnCls = "rounded-md border px-2.5 py-1 border-gray-200 text-gray-700 hover:bg-gray-50";

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
  const [vehicles, setVehicles] = useState([]);
  const [sites, setSites] = useState([]);
  const [gates, setGates] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [siteId, setSiteId] = useState("");
  const [contractorId, setContractorId] = useState("");
  const [waste, setWaste] = useState("");
  const [status, setStatus] = useState("");

  // جلب البيانات من السيرفر
  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/transactions`),
      axios.get(`${API_URL}/sites`),
      axios.get(`${API_URL}/gates`),
      axios.get(`${API_URL}/contractors`),
      axios.get(`${API_URL}/wasteTypesRef`),
      axios.get(`${API_URL}/vehicles`),
    ])
      .then(([txRes, sitesRes, gatesRes, contractorsRes, wasteRes, vehiclesRes]) => {
        setRows(txRes.data);
        setSites(sitesRes.data);
        setGates(gatesRes.data);
        setContractors(contractorsRes.data);
        setWasteTypes(wasteRes.data);
        setVehicles(vehiclesRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // اسم عنصر من قائمة
  const getName = (list, id, key = "id") => list.find((x) => String(x[key]) === String(id))?.name || "-";

  // تاريخ الفلترة: الخروج في صفحة الخروج، وإلا الدخول
  const dateOf = (t) => (mode === "exit" ? t.exitAt : t.entryAt);

  // الفلترة
  const q = search.replace(/\s/g, "").toLowerCase();
  const filtered = rows
    .filter((t) => {
      const date = dateOf(t) ? new Date(dateOf(t)) : null;

      const matchMode = mode !== "exit" || !!t.exitAt;
      const matchSearch =
        !q ||
        (() => {
          const { number, chars } = getTransactionPlate(t, vehicles);
          return (String(number ?? "") + String(chars ?? "").replace(/\s/g, "")).toLowerCase().includes(q);
        })() ||
        txCode(t.id).toLowerCase().includes(q);
      const matchFrom = !from || (date && date >= new Date(from));
      const matchTo = !to || (date && date <= new Date(to + "T23:59:59"));
      const matchSite = !siteId || t.siteId === Number(siteId);
      const matchContractor = !contractorId || t.contractorId === Number(contractorId);
      const matchWaste = !waste || t.wasteTypeCode === Number(waste);
      const matchStatus = !status || t.status === status;

      return matchMode && matchSearch && matchFrom && matchTo && matchSite && matchContractor && matchWaste && matchStatus;
    })
    .sort((a, b) => new Date(dateOf(b)) - new Date(dateOf(a)));

  // إحصائيات اليوم
  const enteredToday = rows.filter((t) => isToday(t.entryAt) && t.status !== "rejected").length;
  const exitedToday = rows.filter((t) => isToday(t.exitAt)).length;
  const inside = rows.filter((t) => t.status === "inside").length;
  const wasteToday = rows
    .filter((t) => isToday(t.exitAt) && t.status === "completed")
    .reduce((sum, t) => sum + (getWasteWeight(t) ?? 0), 0);

  // أعمدة الجدول (تتكرر في كل الأوضاع)
  const plate = (t) => <PlateBadge {...getTransactionPlate(t, vehicles)} />;
  const netWaste = (t) => <b>{tons(getWasteWeight(t))}</b>;
  const code = (t) => (
    <Link to={`/dashboard/transactions/${t.id}`} className="font-mono text-xs text-blue-600 hover:underline" dir="ltr">
      {txCode(t.id)}
    </Link>
  );
  const contractor = (t) => getName(contractors, t.contractorId);
  const state = (t) => <StatusBadge status={t.status} />;
  const time = (value) => <span className="text-xs">{formatDate(value)}</span>;

  const COLUMNS = {
    all: [
      ["رقم العملية", code],
      ["اللوحة", plate],
      ["المقاول", contractor],
      ["الموقع", (t) => getName(sites, t.siteId)],
      ["نوع النفايات", (t) => getName(wasteTypes, t.wasteTypeCode, "code")],
      ["وقت الدخول", (t) => time(t.entryAt)],
      ["وقت الخروج", (t) => time(t.exitAt)],
      ["صافي النفايات (طن)", netWaste],
      ["الحالة", state],
    ],
    entry: [
      ["رقم العملية", code],
      ["اللوحة", plate],
      ["المقاول", contractor],
      ["بوابة الدخول", (t) => getName(gates, t.entryGateId)],
      ["السائق", (t) => t.driverName || "-"],
      ["وقت الدخول", (t) => time(t.entryAt)],
      ["وزن الدخول (طن)", (t) => <b>{tons(t.inWeight)}</b>],
      ["الحالة", state],
    ],
    exit: [
      ["رقم العملية", code],
      ["اللوحة", plate],
      ["المقاول", contractor],
      ["بوابة الخروج", (t) => getName(gates, t.exitGateId)],
      ["وقت الخروج", (t) => time(t.exitAt)],
      ["وزن الخروج (طن)", (t) => tons(t.outWeight)],
      ["صافي النفايات (طن)", netWaste],
      ["الحالة", state],
    ],
  };
  const cols = COLUMNS[mode];

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Current>{title}</Breadcrumb.Current>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      {/* الإحصائيات */}
      {mode === "all" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="الداخلة اليوم" value={enteredToday} color="text-blue-600" />
          <StatCard label="الخارجة اليوم" value={exitedToday} color="text-green-600" />
          <StatCard label="داخل الموقع الآن" value={inside} color="text-orange-600" />
          <StatCard label="نفايات اليوم" value={tons(wasteToday)} unit="طن" color="text-gray-800" />
        </div>
      )}

      {/* الفلاتر */}
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
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select value={contractorId} onChange={(e) => setContractorId(e.target.value)} className={inputCls}>
          <option value="">كل المقاولين</option>
          {contractors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select value={waste} onChange={(e) => setWaste(e.target.value)} className={inputCls}>
          <option value="">كل أنواع النفايات</option>
          {wasteTypes.map((w) => (
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

      {/* الجدول */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {cols.map(([title]) => (
                <th key={title} className="p-3 whitespace-nowrap">
                  {title}
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
                {cols.map(([title, render]) => (
                  <td key={title} className="p-3">
                    {render(t)}
                  </td>
                ))}
                <td className="p-3">
                  <Link to={`/dashboard/transactions/${t.id}`} className={`${actionBtnCls} text-xs`}>
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
