import axios from "axios";
import DeviceForm from "./DeviceForm";

const API_URL = "http://localhost:3000";

const createDevice = (payload) => axios.post(`${API_URL}/devices`, { ...payload, id: Date.now() }).then((response) => response.data);

export default function AddDevice() {
  return (
    <div dir="rtl" className="w-full p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">إضافة جهاز جديد</h1>
      <DeviceForm onSubmit={createDevice} submitLabel="إضافة الجهاز" />
    </div>
  );
}
