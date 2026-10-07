import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import { StatusBadge, ConnectionBadge, TYPE_LABEL, TYPE_ICON, formatDate } from "./DeviceBadges";

const API_URL = "http://localhost:3000";

const selectCls = "border rounded-lg px-3 py-2 text-sm";
const actionBtnCls = "rounded-md border px-2.5 py-1";

const getConnectionStatus = (device) => {
  if (device.connectionStatus === "online" || device.connectionStatus === "offline") return device.connectionStatus;
  return device.connection === "متصل" ? "online" : "offline";
};

const fetchDeviceData = async () => {
  const [devicesRes, gatesRes] = await Promise.all([axios.get(`${API_URL}/devices`), axios.get(`${API_URL}/gates`)]);
  return { devices: devicesRes.data, gates: gatesRes.data };
};

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

export default function DevicesList() {
  const [devices, setDevices] = useState([]);
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [gateId, setGateId] = useState("");
  const [connection, setConnection] = useState("");

  // جلب البيانات من السيرفر
  const loadData = () => {
    setLoading(true);
    fetchDeviceData()
      .then((data) => {
        setDevices(data.devices);
        setGates(data.gates);
      })
      .catch((error) => {
        console.error("Failed to load devices:", error);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;

    fetchDeviceData()
      .then((data) => {
        if (!active) return;
        setDevices(data.devices);
        setGates(data.gates);
      })
      .catch((error) => {
        console.error("Failed to load devices:", error);
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // حذف جهاز
  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الجهاز؟")) return;
    await axios.delete(`${API_URL}/devices/${id}`);
    loadData();
  };

  // اسم البوابة من رقمها
  const getGateName = (device) =>
    gates.find((gate) => String(gate.id) === String(device.gateId ?? device.gate))?.nameAr ||
    gates.find((gate) => String(gate.id) === String(device.gateId ?? device.gate))?.name ||
    device.gate ||
    "-";

  // أنواع الأجهزة الموجودة (بدون تكرار)
  const types = [...new Set(devices.map((d) => d.type).filter(Boolean))];

  // الفلترة
  const text = search.toLowerCase();
  const filtered = devices.filter(
    (d) =>
      ((d.nameAr || d.name || "").toLowerCase().includes(text) ||
        (d.connectionId || "").toLowerCase().includes(text) ||
        (d.ip || "").includes(search)) &&
      (!type || d.type === type) &&
      (!gateId || String(d.gateId ?? gates.find((gate) => gate.name === d.gate)?.id) === gateId) &&
      (!connection || getConnectionStatus(d) === connection)
  );

  // الإحصائيات
  const online = devices.filter((device) => getConnectionStatus(device) === "online").length;
  const maintenance = devices.filter((d) => d.status === "maintenance").length;

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Current>الأجهزة</Breadcrumb.Current>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة الأجهزة</h1>
          <p className="text-sm text-gray-500">الكاميرات والموازين والمتحكمات والحساسات</p>
        </div>
        <Link to="/dashboard/devices/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + إضافة جهاز
        </Link>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="إجمالي الأجهزة" value={devices.length} color="text-gray-800" />
        <StatCard label="متصلة" value={online} color="text-green-600" />
        <StatCard label="غير متصلة" value={devices.length - online} color="text-red-600" />
        <StatCard label="تحت الصيانة" value={maintenance} color="text-yellow-600" />
      </div>

      {/* الفلاتر */}
      <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو المعرّف أو IP..."
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
          <option value="">كل الأنواع</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t] || t}
            </option>
          ))}
        </select>

        <select value={gateId} onChange={(e) => setGateId(e.target.value)} className={selectCls}>
          <option value="">كل البوابات</option>
          {gates.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nameAr || g.name}
            </option>
          ))}
        </select>

        <select value={connection} onChange={(e) => setConnection(e.target.value)} className={selectCls}>
          <option value="">كل حالات الاتصال</option>
          <option value="online">متصل</option>
          <option value="offline">غير متصل</option>
        </select>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">الجهاز</th>
              <th className="p-3">النوع</th>
              <th className="p-3">البوابة</th>
              <th className="p-3">معرّف الاتصال</th>
              <th className="p-3">IP</th>
              <th className="p-3">الاتصال</th>
              <th className="p-3">آخر ظهور</th>
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
                  {loadError ? "تعذّر تحميل الأجهزة. تحقق من تشغيل json-server ثم أعد المحاولة." : "لا توجد أجهزة"}
                </td>
              </tr>
            )}

            {!loading && !loadError && filtered.map((d) => (
              <tr key={d.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">
                  <span className="ml-2">{TYPE_ICON[d.type]}</span>
                  {d.nameAr || d.name || "-"}
                </td>
                <td className="p-3">{TYPE_LABEL[d.type] || d.type || "-"}</td>
                <td className="p-3">{getGateName(d)}</td>
                <td className="p-3 font-mono text-xs" dir="ltr">
                  {d.connectionId || "-"}
                </td>
                <td className="p-3 font-mono text-xs" dir="ltr">
                  {d.ip || "-"}
                </td>
                <td className="p-3">
                  <ConnectionBadge status={getConnectionStatus(d)} />
                </td>
                <td className="p-3 text-xs text-gray-500">{formatDate(d.lastSeen)}</td>
                <td className="p-3">
                  <StatusBadge status={d.status} />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Link to={`/dashboard/devices/${d.id}`} className={`${actionBtnCls} border-gray-200 text-gray-700 hover:bg-gray-50`}>
                      عرض
                    </Link>
                    <Link
                      to={`/dashboard/devices/edit/${d.id}`}
                      className={`${actionBtnCls} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
                    >
                      تعديل
                    </Link>
                    <button
                      onClick={() => handleDelete(d.id)}
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