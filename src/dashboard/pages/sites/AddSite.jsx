import axios from "axios";
import SiteForm from "./SiteForm";

const API_URL = "http://localhost:3000";

const createSite = (payload) => axios.post(`${API_URL}/sites`, { ...payload, id: Date.now() }).then((response) => response.data);

export default function AddSite() {
  return (
    <div dir="rtl" className="w-full p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">إضافة موقع جديد</h1>
      <SiteForm onSubmit={createSite} submitLabel="إضافة الموقع" />
    </div>
  );
}
