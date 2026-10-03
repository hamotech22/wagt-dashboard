import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DeviceForm from "./DeviceForm";

const API_URL = "http://localhost:3000";

const fetchDevice = (id) =>
  axios
    .get(`${API_URL}/devices/${id}`)
    .then((response) => response.data)
    .catch(() => null);
const updateDevice = (id, payload) => axios.put(`${API_URL}/devices/${id}`, { ...payload, id }).then((response) => response.data);

export default function EditDevice() {
  const { id } = useParams();
  const [device, setDevice] = useState(null);

  useEffect(() => {
    fetchDevice(id).then(setDevice);
  }, [id]);

  if (!device) return <div className="p-6 text-gray-400">جارِ التحميل...</div>;

  return (
    <div dir="rtl" className="w-full p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">تعديل الجهاز</h1>
      <DeviceForm initialData={device} onSubmit={(d) => updateDevice(id, d)} submitLabel="حفظ التعديلات" />
    </div>
  );
}
