import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { countPerms } from "./UserBadges";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

const fetchRoles = () =>
  axios
    .get(`${API_URL}/roles`)
    .then((response) => response.data)
    .catch(() => []);
const fetchUsers = () =>
  axios
    .get(`${API_URL}/users`)
    .then((response) => response.data)
    .catch(() => []);
const createRole = (payload) => axios.post(`${API_URL}/roles`, { ...payload, id: Date.now() }).then((response) => response.data);
const updateRole = (id, payload) => axios.put(`${API_URL}/roles/${id}`, { ...payload, id }).then((response) => response.data);
const deleteRole = (id) => axios.delete(`${API_URL}/roles/${id}`).then((response) => response.data);

const inputCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

function RoleModal({ role, onClose, onSave }) {
  const [nameAr, setNameAr] = useState(role?.nameAr || "");
  const [description, setDescription] = useState(role?.description || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!nameAr.trim()) return setError("اسم الدور مطلوب");
    setSaving(true);
    await onSave({ nameAr: nameAr.trim(), description: description.trim() });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <form
        dir="rtl"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-5 space-y-4"
      >
        <h2 className="font-semibold text-gray-800">{role ? "تعديل الدور" : "إضافة دور جديد"}</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اسم الدور *</label>
          <input
            autoFocus
            className={inputCls}
            value={nameAr}
            onChange={(e) => {
              setNameAr(e.target.value);
              setError("");
            }}
          />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
          <textarea rows={3} className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        {!role && <p className="text-xs text-gray-400">بعد الإضافة ستنتقل لصفحة الصلاحيات لتحديد ما يستطيع هذا الدور فعله.</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg text-sm"
          >
            {saving ? "جارِ الحفظ..." : "حفظ"}
          </button>
          <button type="button" onClick={onClose} className="border px-6 py-2 rounded-lg text-sm hover:bg-gray-50">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Roles() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "new" | role

  const load = async () => {
    setLoading(true);
    const [r, u] = await Promise.all([fetchRoles(), fetchUsers()]);
    setRoles(r);
    setUsers(u);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const usersCount = (id) => users.filter((u) => u.roleId === id).length;

  const handleSave = async (data) => {
    if (modal === "new") {
      const created = await createRole(data);
      navigate(`/dashboard/permissions?role=${created.id}`);
      return;
    }
    await updateRole(modal.id, data);
    setModal(null);
    load();
  };

  const handleDelete = async (role) => {
    if (!window.confirm(`هل أنت متأكد من حذف دور "${role.nameAr}"؟`)) return;
    try {
      await deleteRole(role.id);
      load();
    } catch (err) {
      window.alert(err.message);
    }
  };

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/users">المستخدمون والصلاحيات</Breadcrumb.Link>
        <Breadcrumb.Current>الأدوار</Breadcrumb.Current>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الأدوار</h1>
          <p className="text-sm text-gray-500">الأدوار قابلة للتكوين — كل دور يحمل مجموعة صلاحيات وظيفية</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/users" className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
            المستخدمون
          </Link>
          <button onClick={() => setModal("new")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
            + إضافة دور
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">الدور</th>
              <th className="p-3">الوصف</th>
              <th className="p-3">المستخدمون</th>
              <th className="p-3">الصلاحيات</th>
              <th className="p-3">النوع</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  جارِ التحميل...
                </td>
              </tr>
            )}
            {!loading && roles.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  لا توجد أدوار
                </td>
              </tr>
            )}

            {roles.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">{r.nameAr}</td>
                <td className="p-3 text-xs text-gray-500 max-w-[280px]">{r.description || "-"}</td>
                <td className="p-3">{usersCount(r.id)}</td>
                <td className="p-3">{countPerms(r)}</td>
                <td className="p-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      r.isSystem ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {r.isSystem ? "مبدئي" : "مخصص"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-3 text-xs">
                    <Link to={`/dashboard/permissions?role=${r.id}`} className="text-blue-600 hover:underline">
                      الصلاحيات
                    </Link>
                    {!r.locked && (
                      <button onClick={() => setModal(r)} className="text-green-600 hover:underline">
                        تعديل
                      </button>
                    )}
                    {!r.locked && (
                      <button onClick={() => handleDelete(r)} className="text-red-600 hover:underline">
                        حذف
                      </button>
                    )}
                    {r.locked && <span className="text-gray-400">محمي</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && <RoleModal role={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
}
