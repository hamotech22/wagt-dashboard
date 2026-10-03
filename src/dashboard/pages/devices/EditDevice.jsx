import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import DeviceForm from "./DeviceForm";

const API_URL = "http://localhost:3000";

export default function EditDevice() {
  const { id } = useParams();
  const [device, setDevice] = useState(null);

  // جلب بيانات الجهاز
  useEffect(() => {
    axios
      .get(`${API_URL}/devices/${id}`)
      .then((res) => setDevice(res.data))
      .catch(() => {});
  }, [id]);

  // حفظ التعديلات
  const handleUpdate = (data) => axios.put(`${API_URL}/devices/${id}`, { ...data, id });

  if (!device) return <div className="p-6 text-gray-400">جارِ التحميل...</div>;

  return (
    <div dir="rtl" className="w-full p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/devices">الأجهزة</Breadcrumb.Link>
        <Breadcrumb.Current>تعديل الجهاز</Breadcrumb.Current>
      </Breadcrumb>

      <h1 className="text-2xl font-bold text-gray-800">تعديل الجهاز</h1>

      <DeviceForm initialData={device} onSubmit={handleUpdate} submitLabel="حفظ التعديلات" />
    </div>
  );
}
