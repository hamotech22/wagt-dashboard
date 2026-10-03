import axios from "axios";
import Breadcrumb from "../../components/common/Breadcrumb";
import UserForm from "./UserForm";

const API_URL = "http://localhost:3000";

const createUser = (payload) => axios.post(`${API_URL}/users`, { ...payload, id: Date.now() }).then((response) => response.data);

export default function AddUser() {
  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/users">المستخدمون والصلاحيات</Breadcrumb.Link>
        <Breadcrumb.Current>إضافة مستخدم</Breadcrumb.Current>
      </Breadcrumb>
      <h1 className="text-2xl font-bold text-gray-800">إضافة مستخدم جديد</h1>
      <UserForm onSubmit={createUser} submitLabel="إضافة المستخدم" />
    </div>
  );
}
