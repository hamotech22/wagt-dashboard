import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import { StatusBadge, ConnectionBadge, DIRECTION_LABEL, TYPE_LABEL, formatDate } from "./GateBadges";

const API_URL = "http://localhost:3000";

const selectCls = "border rounded-lg px-3 py-2 text-sm";
const actionBtnCls = "rounded-md border px-2.5 py-1";

const gateIsOnline = (gate) => (gate.connectionStatus ?? gate.status) === "online";
const gateStatus = (gate) => gate.maintenance ? "maintenance" : gate.status === "offline" ? "inactive" : gate.status;

const fetchGateData = async () => {
  const [gatesRes, sitesRes, devicesRes] = await Promise.all([
    axios.get(`${API_URL}/gates`),
    axios.get(`${API_URL}/sites`),
    axios.get(`${API_URL}/devices`),
  ]);

  return { gates: gatesRes.data, sites: sitesRes.data, devices: devicesRes.data };
};

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

export default function GatesList() {
  const [gates, setGates] = useState([]);
  const [sites, setSites] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [search, setSearch] = useState("");
  const [siteId, setSiteId] = useState("");
  const [status, setStatus] = useState("");
  const [connection, setConnection] = useState("");

  // جلب البيانات من السيرفر
  const loadData = () => {
    setLoading(true);
    fetchGateData()
      .then((data) => {
        setGates(data.gates);
        setSites(data.sites);
        setDevices(data.devices);
      })
      .catch((error) => {
        console.error("Failed to load gates:", error);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;

    fetchGateData()
      .then((data) => {
        if (!active) return;
        setGates(data.gates);
        setSites(data.sites);
        setDevices(data.devices);
      })
      .catch((error) => {
        console.error("Failed to load gates:", error);
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // حذف بوابة
  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه البوابة؟")) return;
    await axios.delete(`${API_URL}/gates/${id}`);
    loadData();
  };

  // اسم الموقع من رقمه
  const getSiteName = (id) => sites.find((s) => String(s.id) === String(id))?.nameAr || sites.find((s) => String(s.id) === String(id))?.name || "-";

  // عدد الأجهزة المرتبطة ببوابة
  const getDevicesCount = (id, name) =>
    devices.filter((device) => String(device.gateId ?? device.gate) === String(id) || device.gate === name).length;

  // الفلترة
  const filtered = gates.filter(
    (g) =>
      (g.nameAr || g.name || "").toLowerCase().includes(search.trim().toLowerCase()) &&
      (!siteId || String(g.siteId) === siteId) &&
      (!status || gateStatus(g) === status) &&
      (!connection || (gateIsOnline(g) ? "online" : "offline") === connection),
  );

  // الإحصائيات
  const online = gates.filter(gateIsOnline).length;
  const maintenance = gates.filter((g) => gateStatus(g) === "maintenance").length;

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Current>البوابات</Breadcrumb.Current>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة البوابات</h1>
          <p className="text-sm text-gray-500">البوابات الذكية وحالة اتصالها</p>
        </div>
        <Link to="/dashboard/gates/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + إضافة بوابة
        </Link>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="إجمالي البوابات" value={gates.length} color="text-gray-800" />
        <StatCard label="متصلة" value={online} color="text-green-600" />
        <StatCard label="غير متصلة" value={gates.length - online} color="text-red-600" />
        <StatCard label="تحت الصيانة" value={maintenance} color="text-yellow-600" />
      </div>

      {/* الفلاتر */}
      <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث باسم البوابة..."
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select value={siteId} onChange={(e) => setSiteId(e.target.value)} className={selectCls}>
          <option value="">كل المواقع</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
          <option value="">كل الحالات</option>
          <option value="active">نشطة</option>
          <option value="maintenance">صيانة</option>
          <option value="inactive">غير نشطة</option>
        </select>

        <select value={connection} onChange={(e) => setConnection(e.target.value)} className={selectCls}>
          <option value="">كل حالات الاتصال</option>
          <option value="online">متصلة</option>
          <option value="offline">غير متصلة</option>
        </select>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">البوابة</th>
              <th className="p-3">الموقع</th>
              <th className="p-3">النوع</th>
              <th className="p-3">الاتجاه</th>
              <th className="p-3">الأجهزة</th>
              <th className="p-3">الاتصال</th>
              <th className="p-3">آخر اتصال</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400">
                  جارِ التحميل...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400">
                  {loadError ? "تعذّر تحميل البوابات. تحقق من تشغيل json-server ثم أعد المحاولة." : "لا توجد بوابات"}
                </td>
              </tr>
            )}

            {!loading && !loadError && filtered.map((g) => (
              <tr key={g.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">{g.nameAr || g.name || "بوابة بدون اسم"}</td>
                <td className="p-3">{getSiteName(g.siteId)}</td>
                <td className="p-3">{TYPE_LABEL[g.type] || "-"}</td>
                <td className="p-3">{DIRECTION_LABEL[g.direction] || "-"}</td>
                <td className="p-3">{getDevicesCount(g.id, g.nameAr || g.name)}</td>
                <td className="p-3">
                  <ConnectionBadge status={gateIsOnline(g) ? "online" : "offline"} />
                </td>
                <td className="p-3 text-xs text-gray-500">{formatDate(g.lastConnection)}</td>
                <td className="p-3">
                  <StatusBadge status={gateStatus(g)} />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Link to={`/dashboard/gates/${g.id}`} className={`${actionBtnCls} border-gray-200 text-gray-700 hover:bg-gray-50`}>
                      عرض
                    </Link>
                    <Link
                      to={`/dashboard/gates/edit/${g.id}`}
                      className={`${actionBtnCls} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
                    >
                      تعديل
                    </Link>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className={`${actionBtnCls} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
