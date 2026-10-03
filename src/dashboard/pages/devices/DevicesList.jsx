import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import { StatusBadge, ConnectionBadge, TYPE_LABEL, TYPE_ICON, formatDate } from "./DeviceBadges";

const API_URL = "http://localhost:3000";

const fetchDevices = () =>
  axios
    .get(`${API_URL}/devices`)
    .then((response) => response.data)
    .catch(() => []);
const fetchDeviceLookups = () =>
  axios
    .get(`${API_URL}/gates`)
    .then((response) => ({ gates: response?.data ?? [] }))
    .catch(() => ({ gates: [] }));
const normalizeDeviceData = (devices, gates) => {
  const normalizedDevices = devices.map((device) => {
    const name = device.nameAr ?? device.name ?? "";
    const gate = gates.find((item) => String(item.id) === String(device.gateId) || item.name === device.gate);
    const connectionStatus =
      device.connectionStatus ??
      (device.connection === "متصل" ? "online" : device.connection === "غير متصل" ? "offline" : "offline");

    return {
      ...device,
      nameAr: name,
      gateId: device.gateId ?? gate?.id,
      connectionId: device.connectionId ?? "-",
      ip: device.ip ?? "",
      connectionStatus,
      status:
        device.status === "متصل" ? "active" : device.status === "غير متصل" ? "inactive" : (device.status ?? "active"),
    };
  });

  return {
    devices: normalizedDevices,
    types: [...new Set(normalizedDevices.map((device) => device.type).filter(Boolean))].map((value) => ({
      value,
      label: TYPE_LABEL[value] ?? value,
    })),
  };
};
const deleteDevice = (id) => axios.delete(`${API_URL}/devices/${id}`).then((response) => response.data);

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
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [gateId, setGateId] = useState("");
  const [connection, setConnection] = useState("");

  useEffect(() => {
    Promise.all([fetchDevices(), fetchDeviceLookups()])
      .then(([deviceData, lookups]) => {
        const normalized = normalizeDeviceData(deviceData, lookups.gates);
        setDevices(normalized.devices);
        setGates(lookups.gates);
        setTypes(normalized.types);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      devices.filter(
        (d) =>
          (!search ||
            String(d.nameAr ?? "").includes(search) ||
            String(d.connectionId ?? "").toLowerCase().includes(search.toLowerCase()) ||
            String(d.ip ?? "").includes(search)) &&
          (!type || d.type === type) &&
          (!gateId || String(d.gateId) === gateId) &&
          (!connection || d.connectionStatus === connection),
      ),
    [devices, search, type, gateId, connection],
  );

  const gateName = (id) => gates.find((g) => String(g.id) === String(id))?.name || "-";
  const online = devices.filter((d) => d.connectionStatus === "online").length;

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الجهاز؟")) return;
    await deleteDevice(id);
    setLoading(true);
    Promise.all([fetchDevices(), fetchDeviceLookups()]).then(([deviceData, lookups]) => {
      const normalized = normalizeDeviceData(deviceData, lookups.gates);
      setDevices(normalized.devices);
      setGates(lookups.gates);
      setTypes(normalized.types);
      setLoading(false);
    });
  };

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
        <Link to="/dashboard/devices/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
          + إضافة جهاز
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="إجمالي الأجهزة" value={devices.length} color="text-gray-800" />
        <StatCard label="متصلة" value={online} color="text-green-600" />
        <StatCard label="غير متصلة" value={devices.length - online} color="text-red-600" />
        <StatCard label="تحت الصيانة" value={devices.filter((d) => d.status === "maintenance").length} color="text-yellow-600" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو المعرّف أو IP..."
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">كل الأنواع</option>
          {types.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select value={gateId} onChange={(e) => setGateId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">كل البوابات</option>
          {gates.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <select value={connection} onChange={(e) => setConnection(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">كل حالات الاتصال</option>
          <option value="online">متصل</option>
          <option value="offline">غير متصل</option>
        </select>
      </div>

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
                  لا توجد أجهزة
                </td>
              </tr>
            )}

            {filtered.map((d) => (
              <tr key={d.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">
                  <span className="ml-2">{TYPE_ICON[d.type]}</span>
                  {d.nameAr || "-"}
                </td>
                <td className="p-3">{TYPE_LABEL[d.type] || d.type || "-"}</td>
                <td className="p-3">{gateName(d.gateId)}</td>
                <td className="p-3 font-mono text-xs" dir="ltr">
                  {d.connectionId || "-"}
                </td>
                <td className="p-3 font-mono text-xs" dir="ltr">
                  {d.ip || "-"}
                </td>
                <td className="p-3">
                  <ConnectionBadge status={d.connectionStatus} />
                </td>
                <td className="p-3 text-xs text-gray-500">{formatDate(d.lastSeen)}</td>
                <td className="p-3">
                  <StatusBadge status={d.status} />
                </td>
                <td className="p-3">
                  <div className="flex gap-3 text-xs">
                    <Link to={`/dashboard/devices/${d.id}`} className="text-blue-600 hover:underline">
                      عرض
                    </Link>
                    <Link to={`/dashboard/devices/edit/${d.id}`} className="text-green-600 hover:underline">
                      تعديل
                    </Link>
                    <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:underline">
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
