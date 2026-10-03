import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import { StatusBadge, Avatar, STATUS_OPTIONS, SCOPE_LEVELS, formatDate, scopeText } from "./UserBadges";

const API_URL = "http://localhost:3000";

const fetchUsers = () =>
  axios
    .get(`${API_URL}/users`)
    .then((response) => response.data)
    .catch(() => []);
const fetchUserLookups = () =>
  Promise.all([
    axios.get(`${API_URL}/roles`),
    axios.get(`${API_URL}/municipalities`),
    axios.get(`${API_URL}/projects`),
    axios.get(`${API_URL}/gates`),
    axios.get(`${API_URL}/contractors`),
    axios.get(`${API_URL}/sites`),
  ]).then(([roles, municipalities, projects, gates, contractors, sites]) => ({
    roles: roles.data,
    municipalities: municipalities.data,
    projects: projects.data,
    gates: gates.data,
    contractors: contractors.data,
    sites: sites.data,
  }));
const deleteUser = (id) => axios.delete(`${API_URL}/users/${id}`).then((response) => response.data);
const updateUser = (id, payload) => axios.put(`${API_URL}/users/${id}`, { ...payload, id }).then((response) => response.data);

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [lookups, setLookups] = useState({
    roles: [],
    municipalities: [],
    projects: [],
    gates: [],
    contractors: [],
    sites: [],
  });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState("");
  const [status, setStatus] = useState("");
  const [scopeLevel, setScopeLevel] = useState("");

  const load = async () => {
    setLoading(true);
    const [u, l] = await Promise.all([fetchUsers(), fetchUserLookups()]);
    setUsers(u);
    setLookups(l);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (!search || u.fullName.includes(search) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
        (!roleId || u.roleId === Number(roleId)) &&
        (!status || u.status === status) &&
        (!scopeLevel || u.scopeLevel === scopeLevel),
    );
  }, [users, search, roleId, status, scopeLevel]);

  const roleName = (id) => lookups.roles.find((r) => String(r.id) === String(id))?.nameAr || "-";

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    await deleteUser(id);
    load();
  };

  const toggleStatus = async (u) => {
    await updateUser(u.id, { status: u.status === "active" ? "inactive" : "active" });
    load();
  };

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Current>المستخدمون والصلاحيات</Breadcrumb.Current>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h1>
          <p className="text-sm text-gray-500">الحسابات والأدوار ونطاق البيانات والوحدات المصرّح بها</p>
        </div>
        <div className="flex gap-2">
          {/* تم تصحيح المسار من /dashboard/roles إلى /dashboard/users/roles ليطابق تعريف Route في App.jsx */}
          <Link to="/dashboard/users/roles" className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
            الأدوار
          </Link>
          <Link to="/dashboard/users/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
            + إضافة مستخدم
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="إجمالي المستخدمين" value={users.length} color="text-gray-800" />
        <StatCard label="نشطون" value={users.filter((u) => u.status === "active").length} color="text-green-600" />
        <StatCard label="غير نشطين" value={users.filter((u) => u.status === "inactive").length} color="text-gray-600" />
        <StatCard label="حسابات مقفلة" value={users.filter((u) => u.status === "locked").length} color="text-red-600" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو اسم المستخدم أو البريد..."
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">كل الأدوار</option>
          {lookups.roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nameAr}
            </option>
          ))}
        </select>
        <select value={scopeLevel} onChange={(e) => setScopeLevel(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">كل مستويات النطاق</option>
          {SCOPE_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">كل الحالات</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">المستخدم</th>
              <th className="p-3">اسم المستخدم</th>
              <th className="p-3">الدور</th>
              <th className="p-3">نطاق البيانات</th>
              <th className="p-3">الوحدات</th>
              <th className="p-3">آخر دخول</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  جارِ التحميل...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  لا يوجد مستخدمون
                </td>
              </tr>
            )}

            {filtered.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.fullName} />
                    <div>
                      <div className="font-medium text-gray-800">{u.fullName}</div>
                      <div className="text-xs text-gray-400" dir="ltr">
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-3 font-mono text-xs" dir="ltr">
                  {u.username}
                </td>
                <td className="p-3">{roleName(u.roleId)}</td>
                <td className="p-3 text-xs text-gray-600 max-w-[220px]">{scopeText(u, lookups)}</td>
                <td className="p-3 text-xs text-gray-600">{u.modules.length} وحدات</td>
                <td className="p-3 text-xs text-gray-500">{formatDate(u.lastLogin)}</td>
                <td className="p-3">
                  <StatusBadge status={u.status} />
                </td>
                <td className="p-3">
                  <div className="flex gap-3 text-xs">
                    <Link to={`/dashboard/users/${u.id}`} className="text-blue-600 hover:underline">
                      عرض
                    </Link>
                    <Link to={`/dashboard/users/edit/${u.id}`} className="text-green-600 hover:underline">
                      تعديل
                    </Link>
                    <button onClick={() => toggleStatus(u)} className="text-yellow-600 hover:underline">
                      {u.status === "active" ? "تعطيل" : "تفعيل"}
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline">
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
