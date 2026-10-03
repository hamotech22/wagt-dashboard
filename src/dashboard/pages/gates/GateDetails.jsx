import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge, ConnectionBadge, DIRECTION_LABEL, TYPE_LABEL, DEVICE_LABEL, formatDate } from "./GateBadges";

const API_URL = "http://localhost:3000";

const fetchGate = (id) =>
  axios
    .get(`${API_URL}/gates/${id}`)
    .then((response) => response.data)
    .catch(() => null);
const fetchGateLookups = () =>
  axios
    .all([axios.get(`${API_URL}/sites`), axios.get(`${API_URL}/devices`)])
    .then(([sitesRes, devicesRes]) => ({
      sites: sitesRes?.data ?? [],
      devices: devicesRes?.data ?? [],
    }))
    .catch(() => ({ sites: [], devices: [] }));

function Item({ label, children }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-sm text-gray-800">{children || "-"}</div>
    </div>
  );
}

export default function GateDetails() {
  const { id } = useParams();
  const [gate, setGate] = useState(null);
  const [sites, setSites] = useState([]);

  useEffect(() => {
    Promise.all([fetchGate(id), fetchGateLookups()]).then(([g, l]) => {
      if (!g) {
        setGate(null);
        setSites(l.sites);
        return;
      }

      const name = g.nameAr ?? g.name ?? "";
      setGate({
        ...g,
        nameAr: name,
        status: g.status === "online" ? "active" : g.status === "offline" ? "inactive" : g.status,
        connectionStatus:
          g.connectionStatus ?? (g.status === "online" || g.status === "offline" ? g.status : "offline"),
        integration: g.integration ?? {},
        devices: Array.isArray(g.devices) ? g.devices : l.devices.filter((device) => device.gate === name),
      });
      setSites(l.sites);
    });
  }, [id]);

  if (!gate) return <div className="p-6 text-gray-400">جارِ التحميل...</div>;

  const site = sites.find((s) => String(s.id) === String(gate.siteId))?.name;

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">{gate.nameAr || "بوابة"}</h1>
          <ConnectionBadge status={gate.connectionStatus} />
        </div>
        <div className="flex gap-2">
          <Link to={`/dashboard/gates/edit/${gate.id}`} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
            تعديل
          </Link>
          <Link to="/dashboard/gates" className="border px-4 py-2 rounded-lg text-sm">
            رجوع
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5 grid grid-cols-2 gap-5">
          <Item label="الحالة">
            <StatusBadge status={gate.status} />
          </Item>
          <Item label="الموقع">{site}</Item>
          <Item label="النوع">{TYPE_LABEL[gate.type]}</Item>
          <Item label="الاتجاه">{DIRECTION_LABEL[gate.direction]}</Item>
          <Item label="آخر اتصال">{formatDate(gate.lastConnection)}</Item>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
          <h3 className="font-semibold text-gray-800">إعدادات التكامل</h3>
          <Item label="الإرسال التلقائي">
            {gate.integration.autoSubmit == null ? "-" : gate.integration.autoSubmit ? "مفعّل" : "متوقف"}
          </Item>
          <Item label="محاولات إعادة الإرسال">{gate.integration.maxRetries ?? "-"}</Item>
        </div>
      </div>

      {/* الأجهزة */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">الأجهزة المرتبطة ({gate.devices.length})</h3>
          <Link to="/dashboard/devices/add" className="text-sm text-blue-600 hover:underline">
            + إضافة جهاز
          </Link>
        </div>

        {gate.devices.length === 0 ? (
          <p className="text-sm text-gray-400">لا توجد أجهزة مرتبطة بهذه البوابة.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {gate.devices.map((d) => (
              <Link
                key={d.id}
                to={`/dashboard/devices/${d.id}`}
                className="border rounded-lg p-3 hover:bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-gray-800">{d.name}</div>
                  <div className="text-xs text-gray-400">{DEVICE_LABEL[d.type] || d.type}</div>
                </div>
                <ConnectionBadge
                  status={d.status ?? (d.connection === "متصل" ? "online" : "offline")}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
