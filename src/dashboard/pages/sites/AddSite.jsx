import axios from "axios";
import Breadcrumb from "../../components/common/Breadcrumb";
import SiteForm from "./SiteForm";

const API_URL = "http://localhost:3000";

const createSite = (payload) => axios.post(`${API_URL}/sites`, { ...payload, id: Date.now() }).then((response) => response.data);

export default function AddSite() {
  return (
    <div dir="rtl" className="w-full p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/sites">المواقع</Breadcrumb.Link>
        <Breadcrumb.Current>إضافة موقع</Breadcrumb.Current>
      </Breadcrumb>
      <h1 className="text-2xl font-bold text-gray-800">إضافة موقع جديد</h1>
      <SiteForm onSubmit={createSite} submitLabel="إضافة الموقع" />
    </div>
  );
}
