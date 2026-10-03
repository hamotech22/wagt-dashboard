import axios from "axios";
import GateForm from "./GateForm";

const API_URL = "http://localhost:3000";

const createGate = (payload) => axios.post(`${API_URL}/gates`, { ...payload, id: Date.now() }).then((response) => response.data);

export default function AddGate() {
  return (
    <div dir="rtl" className="w-full p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">إضافة بوابة جديدة</h1>
      <GateForm onSubmit={createGate} submitLabel="إضافة البوابة" />
    </div>
  );
}
