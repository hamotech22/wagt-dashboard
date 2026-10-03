import axios from "axios";
import UserForm from "./UserForm";

const API_URL = "http://localhost:3000";

const createUser = (payload) => axios.post(`${API_URL}/users`, { ...payload, id: Date.now() }).then((response) => response.data);

export default function AddUser() {
  return (
    <div dir="rtl" className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">إضافة مستخدم جديد</h1>
      <UserForm onSubmit={createUser} submitLabel="إضافة المستخدم" />
    </div>
  );
}
