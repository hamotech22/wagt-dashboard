import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import SiteForm from "./SiteForm";

const API_URL = "http://localhost:3000";

const fetchSite = (id) =>
  axios
    .get(`${API_URL}/sites/${id}`)
    .then((response) => response.data)
    .catch(() => null);
const updateSite = (id, payload) => axios.put(`${API_URL}/sites/${id}`, { ...payload, id }).then((response) => response.data);

export default function EditSite() {
  const { id } = useParams();
  const [site, setSite] = useState(null);

  useEffect(() => {
    fetchSite(id).then(setSite);
  }, [id]);

  if (!site) return <div className="p-6 text-gray-400">جارِ التحميل...</div>;

  return (
    <div dir="rtl" className="w-full p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/sites">المواقع</Breadcrumb.Link>
        <Breadcrumb.Current>تعديل الموقع</Breadcrumb.Current>
      </Breadcrumb>
      <h1 className="text-2xl font-bold text-gray-800">تعديل الموقع</h1>
      <SiteForm initialData={site} onSubmit={(data) => updateSite(id, data)} submitLabel="حفظ التعديلات" />
    </div>
  );
}
