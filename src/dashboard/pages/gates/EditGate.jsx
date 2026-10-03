import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import GateForm from "./GateForm";

const API_URL = "http://localhost:3000";

const fetchGate = (id) =>
  axios
    .get(`${API_URL}/gates/${id}`)
    .then((response) => response.data)
    .catch(() => null);
const updateGate = (id, payload) => axios.put(`${API_URL}/gates/${id}`, { ...payload, id }).then((response) => response.data);

export default function EditGate() {
  const { id } = useParams();
  const [gate, setGate] = useState(null);

  useEffect(() => {
    fetchGate(id).then(setGate);
  }, [id]);

  if (!gate) return <div className="p-6 text-gray-400">جارِ التحميل...</div>;

  return (
    <div dir="rtl" className="w-full p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/gates">البوابات</Breadcrumb.Link>
        <Breadcrumb.Current>تعديل البوابة</Breadcrumb.Current>
      </Breadcrumb>
      <h1 className="text-2xl font-bold text-gray-800">تعديل البوابة</h1>
      <GateForm initialData={gate} onSubmit={(d) => updateGate(id, d)} submitLabel="حفظ التعديلات" />
    </div>
  );
}
