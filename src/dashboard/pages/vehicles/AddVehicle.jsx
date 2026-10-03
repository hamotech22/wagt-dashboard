import axios from "axios";
import VehicleForm from "./VehicleForm";

const API_URL = "http://localhost:3000";

const createVehicle = (payload) => axios.post(`${API_URL}/vehicles`, { ...payload, id: Date.now() }).then((response) => response.data);

export default function AddVehicle() {
  return (
    <div dir="rtl" className="w-full p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">إضافة مركبة جديدة</h1>
      <VehicleForm onSubmit={createVehicle} submitLabel="إضافة المركبة" />
    </div>
  );
}
