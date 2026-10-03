import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import VehicleForm from "./VehicleForm";

const API_URL = "http://localhost:3000";

const fetchVehicle = (id) =>
  axios
    .get(`${API_URL}/vehicles/${id}`)
    .then((response) => response.data)
    .catch(() => null);
const updateVehicle = (id, payload) => axios.put(`${API_URL}/vehicles/${id}`, { ...payload, id }).then((response) => response.data);

export default function EditVehicle() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    fetchVehicle(id).then(setVehicle);
  }, [id]);

  if (!vehicle) return <div className="p-6 text-gray-400">جارِ التحميل...</div>;

  return (
    <div dir="rtl" className="w-full p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/vehicles">المركبات</Breadcrumb.Link>
        <Breadcrumb.Current>تعديل المركبة</Breadcrumb.Current>
      </Breadcrumb>
      <h1 className="text-2xl font-bold text-gray-800">تعديل المركبة</h1>
      <VehicleForm initialData={vehicle} onSubmit={(d) => updateVehicle(id, d)} submitLabel="حفظ التعديلات" />
    </div>
  );
}
