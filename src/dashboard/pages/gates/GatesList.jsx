import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import { StatusBadge, ConnectionBadge, DIRECTION_LABEL, TYPE_LABEL, formatDate } from "./GateBadges";

const API_URL = "http://localhost:3000";

const fetchGates = () =>
  axios
    .get(`${API_URL}/gates`)
    .then((response) => (Array.isArray(response.data) ? response.data : []))
    .catch(() => []);
const fetchGateLookups = () =>
  axios
    .all([axios.get(`${API_URL}/sites`), axios.get(`${API_URL}/devices`)])
    .then(([sitesRes, devicesRes]) => ({
      sites: sitesRes?.data ?? [],
      devices: devicesRes?.data ?? [],
    }))
    .catch(() => ({ sites: [], devices: [] }));
const fetchGateData = () =>
  Promise.all([fetchGates(), fetchGateLookups()]).then(([gates, lookups]) => ({
    sites: lookups.sites,
    gates: gates.map((gate) => {
      const name = gate.nameAr ?? gate.name ?? "";
      const connectionStatus =
        gate.connectionStatus ?? (gate.status === "online" || gate.status === "offline" ? gate.status : "offline");

      return {
        ...gate,
        nameAr: name,
        connectionStatus,
        status: gate.status === "online" ? "active" : gate.status === "offline" ? "inactive" : (gate.status ?? "inactive"),
        devices: Array.isArray(gate.devices) ? gate.devices : lookups.devices.filter((device) => device.gate === name),
      };
    }),
  }));
const deleteGate = (id) => axios.delete(`${API_URL}/gates/${id}`).then((response) => response.data);

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
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [siteId, setSiteId] = useState("");
  const [status, setStatus] = useState("");
  const [connection, setConnection] = useState("");

  const load = () =>
    fetchGateData().then(({ gates: nextGates, sites: nextSites }) => {
      setGates(nextGates);
      setSites(nextSites);
      setLoading(false);
    });

  useEffect(() => {
    fetchGateData().then(({ gates: nextGates, sites: nextSites }) => {
      setGates(nextGates);
      setSites(nextSites);
      setLoading(false);
    });
  }, []);

  const reload = () => {
    setLoading(true);
    return load();
  };

  const filtered = useMemo(
    () =>
      gates.filter(
        (g) =>
          (!search || g.nameAr.includes(search)) &&
          (!siteId || String(g.siteId) === siteId) &&
          (!status || g.status === status) &&
          (!connection || g.connectionStatus === connection),
      ),
    [gates, search, siteId, status, connection],
  );

  const siteName = (id) => sites.find((s) => String(s.id) === String(id))?.name || "-";
  const online = gates.filter((g) => g.connectionStatus === "online").length;

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه البوابة؟")) return;
    await deleteGate(id);
    reload();
  };

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
        <Link to="/dashboard/gates/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
          + إضافة بوابة
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="إجمالي البوابات" value={gates.length} color="text-gray-800" />
        <StatCard label="متصلة" value={online} color="text-green-600" />
        <StatCard label="غير متصلة" value={gates.length - online} color="text-red-600" />
        <StatCard label="تحت الصيانة" value={gates.filter((g) => g.status === "maintenance").length} color="text-yellow-600" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث باسم البوابة..."
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={siteId} onChange={(e) => setSiteId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">كل المواقع</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">كل الحالات</option>
          <option value="active">نشطة</option>
          <option value="maintenance">صيانة</option>
          <option value="inactive">غير نشطة</option>
        </select>
        <select value={connection} onChange={(e) => setConnection(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">كل حالات الاتصال</option>
          <option value="online">متصلة</option>
          <option value="offline">غير متصلة</option>
        </select>
      </div>

      {/* Table */}
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
                  لا توجد بوابات
                </td>
              </tr>
            )}

            {filtered.map((g) => (
              <tr key={g.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">{g.nameAr}</td>
                <td className="p-3">{siteName(g.siteId)}</td>
                <td className="p-3">{TYPE_LABEL[g.type] || "-"}</td>
                <td className="p-3">{DIRECTION_LABEL[g.direction] || "-"}</td>
                <td className="p-3">{g.devices.length}</td>
                <td className="p-3">
                  <ConnectionBadge status={g.connectionStatus} />
                </td>
                <td className="p-3 text-xs text-gray-500">{formatDate(g.lastConnection)}</td>
                <td className="p-3">
                  <StatusBadge status={g.status} />
                </td>
                <td className="p-3">
                  <div className="flex gap-3 text-xs">
                    <Link to={`/dashboard/gates/${g.id}`} className="text-blue-600 hover:underline">
                      عرض
                    </Link>
                    <Link to={`/dashboard/gates/edit/${g.id}`} className="text-green-600 hover:underline">
                      تعديل
                    </Link>
                    <button onClick={() => handleDelete(g.id)} className="text-red-600 hover:underline">
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
