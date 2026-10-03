import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge, ConnectionBadge, DIRECTION_LABEL, TYPE_LABEL, DEVICE_LABEL, formatDate } from "./GateBadges";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

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
  const [site, setSite] = useState(null);
  const [devices, setDevices] = useState([]);

  // جلب بيانات البوابة، ثم الموقع والأجهزة المرتبطة بها
  useEffect(() => {
    axios
      .get(`${API_URL}/gates/${id}`)
      .then(({ data }) => {
        setGate(data);
        return Promise.all([axios.get(`${API_URL}/sites/${data.siteId}`), axios.get(`${API_URL}/devices?gateId=${data.id}`)]);
      })
      .then(([siteRes, devicesRes]) => {
        setSite(siteRes.data);
        setDevices(devicesRes.data);
      })
      .catch(() => {});
  }, [id]);

  if (!gate) return <div className="p-6 text-gray-400">جارِ التحميل...</div>;

  const integration = gate.integration || {};

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/gates">البوابات</Breadcrumb.Link>
        <Breadcrumb.Current>{gate.nameAr || "تفاصيل البوابة"}</Breadcrumb.Current>
      </Breadcrumb>

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
          <Item label="الموقع">{site?.name}</Item>
          <Item label="النوع">{TYPE_LABEL[gate.type]}</Item>
          <Item label="الاتجاه">{DIRECTION_LABEL[gate.direction]}</Item>
          <Item label="آخر اتصال">{formatDate(gate.lastConnection)}</Item>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
          <h3 className="font-semibold text-gray-800">إعدادات التكامل</h3>
          <Item label="الإرسال التلقائي">{integration.autoSubmit == null ? "-" : integration.autoSubmit ? "مفعّل" : "متوقف"}</Item>
          <Item label="محاولات إعادة الإرسال">{integration.maxRetries ?? "-"}</Item>
        </div>
      </div>

      {/* الأجهزة */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">الأجهزة المرتبطة ({devices.length})</h3>
          <Link to="/dashboard/devices/add" className="text-sm text-blue-600 hover:underline">
            + إضافة جهاز
          </Link>
        </div>

        {devices.length === 0 ? (
          <p className="text-sm text-gray-400">لا توجد أجهزة مرتبطة بهذه البوابة.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {devices.map((d) => (
              <Link
                key={d.id}
                to={`/dashboard/devices/${d.id}`}
                className="border rounded-lg p-3 hover:bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-gray-800">{d.nameAr}</div>
                  <div className="text-xs text-gray-400">{DEVICE_LABEL[d.type] || d.type}</div>
                </div>
                <ConnectionBadge status={d.connectionStatus} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
