import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserForm from "./UserForm";

const API_URL = "http://localhost:3000";

const fetchUser = (id) =>
  axios
    .get(`${API_URL}/users/${id}`)
    .then((response) => response.data)
    .catch(() => null);
const updateUser = (id, payload) => axios.put(`${API_URL}/users/${id}`, { ...payload, id }).then((response) => response.data);

export default function EditUser() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(id).then(setUser);
  }, [id]);

  if (!user) return <div className="p-6 text-gray-400">جارِ التحميل...</div>;

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">تعديل المستخدم</h1>
      <UserForm initialData={user} onSubmit={(d) => updateUser(id, d)} submitLabel="حفظ التعديلات" />
    </div>
  );
}
