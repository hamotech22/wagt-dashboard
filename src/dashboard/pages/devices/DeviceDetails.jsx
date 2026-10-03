import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge, ConnectionBadge, TYPE_LABEL, TYPE_ICON, formatDate } from "./DeviceBadges";
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

export default function DeviceDetails() {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [gate, setGate] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/devices/${id}`)
      .then(({ data }) => {
        setDevice(data);
        return axios.get(`${API_URL}/gates/${data.gateId}`);
      })
      .then(({ data }) => setGate(data))
      .catch(() => {});
  }, [id]);

  if (!device) return <div className="p-6 text-gray-400">جارِ التحميل...</div>;

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/devices">الأجهزة</Breadcrumb.Link>
        <Breadcrumb.Current>{device.nameAr || "تفاصيل الجهاز"}</Breadcrumb.Current>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{TYPE_ICON[device.type]}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{device.nameAr}</h1>
            <p className="text-sm text-gray-400">{TYPE_LABEL[device.type]}</p>
          </div>
          <ConnectionBadge status={device.connectionStatus} />
        </div>
        <div className="flex gap-2">
          <Link to={`/dashboard/devices/edit/${device.id}`} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
            تعديل
          </Link>
          <Link to="/dashboard/devices" className="border px-4 py-2 rounded-lg text-sm">
            رجوع
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5 grid grid-cols-2 gap-5">
          <h3 className="col-span-2 font-semibold text-gray-800">معلومات عامة</h3>
          <Item label="الحالة">
            <StatusBadge status={device.status} />
          </Item>
          <Item label="البوابة">
            {gate && (
              <Link to={`/dashboard/gates/${gate.id}`} className="text-blue-600 hover:underline">
                {gate.name}
              </Link>
            )}
          </Item>
          <Item label="تاريخ التركيب">{formatDate(device.installDate, false)}</Item>
          <Item label="آخر ظهور">{formatDate(device.lastSeen)}</Item>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 grid grid-cols-2 gap-5">
          <h3 className="col-span-2 font-semibold text-gray-800">الاتصال والتقنية</h3>
          <Item label="معرّف الاتصال">
            <span className="font-mono" dir="ltr">
              {device.connectionId}
            </span>
          </Item>
          <Item label="عنوان IP">
            <span className="font-mono" dir="ltr">
              {device.ip}
            </span>
          </Item>
          <Item label="إصدار Firmware">
            <span dir="ltr">{device.firmware}</span>
          </Item>
        </div>
      </div>
    </div>
  );
}
