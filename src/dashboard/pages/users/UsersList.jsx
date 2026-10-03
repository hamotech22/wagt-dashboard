import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import { StatusBadge, Avatar, STATUS_OPTIONS, SCOPE_LEVELS, formatDate, scopeText } from "./UserBadges";

const API_URL = "http://localhost:3000";

const selectCls = "border rounded-lg px-3 py-2 text-sm";
const actionBtnCls = "rounded-md border px-2.5 py-1";

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
  const [roles, setRoles] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [gates, setGates] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState("");
  const [status, setStatus] = useState("");
  const [scopeLevel, setScopeLevel] = useState("");

  // جلب البيانات من السيرفر
  const loadData = () => {
    setLoading(true);
    Promise.all([
      axios.get(`${API_URL}/users`),
      axios.get(`${API_URL}/roles`),
      axios.get(`${API_URL}/municipalities`),
      axios.get(`${API_URL}/projects`),
      axios.get(`${API_URL}/gates`),
      axios.get(`${API_URL}/contractors`),
      axios.get(`${API_URL}/sites`),
    ])
      .then(([usersRes, rolesRes, municipalitiesRes, projectsRes, gatesRes, contractorsRes, sitesRes]) => {
        setUsers(usersRes.data);
        setRoles(rolesRes.data);
        setMunicipalities(municipalitiesRes.data);
        setProjects(projectsRes.data);
        setGates(gatesRes.data);
        setContractors(contractorsRes.data);
        setSites(sitesRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // حذف مستخدم
  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    await axios.delete(`${API_URL}/users/${id}`);
    loadData();
  };

  // تفعيل / تعطيل مستخدم (PATCH يعدّل الحالة فقط ويحافظ على باقي البيانات)
  const toggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    await axios.patch(`${API_URL}/users/${user.id}`, { status: newStatus });
    loadData();
  };

  // اسم الدور من رقمه
  const getRoleName = (id) => roles.find((r) => String(r.id) === String(id))?.nameAr || "-";

  // الفلترة
  const text = search.toLowerCase();
  const filtered = users.filter(
    (u) =>
      ((u.fullName || "").toLowerCase().includes(text) ||
        (u.username || "").toLowerCase().includes(text) ||
        (u.email || "").toLowerCase().includes(text)) &&
      (!roleId || u.roleId === Number(roleId)) &&
      (!status || u.status === status) &&
      (!scopeLevel || u.scopeLevel === scopeLevel),
  );

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
          <Link to="/dashboard/users/roles" className="border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            الأدوار
          </Link>
          <Link to="/dashboard/users/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + إضافة مستخدم
          </Link>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="إجمالي المستخدمين" value={users.length} color="text-gray-800" />
        <StatCard label="نشطون" value={users.filter((u) => u.status === "active").length} color="text-green-600" />
        <StatCard label="غير نشطين" value={users.filter((u) => u.status === "inactive").length} color="text-gray-600" />
        <StatCard label="حسابات مقفلة" value={users.filter((u) => u.status === "locked").length} color="text-red-600" />
      </div>

      {/* الفلاتر */}
      <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو اسم المستخدم أو البريد..."
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className={selectCls}>
          <option value="">كل الأدوار</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nameAr}
            </option>
          ))}
        </select>

        <select value={scopeLevel} onChange={(e) => setScopeLevel(e.target.value)} className={selectCls}>
          <option value="">كل مستويات النطاق</option>
          {SCOPE_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
          <option value="">كل الحالات</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* الجدول */}
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
                <td className="p-3">{getRoleName(u.roleId)}</td>
                <td className="p-3 text-xs text-gray-600 max-w-[220px]">
                  {scopeText(u, { roles, municipalities, projects, gates, contractors, sites })}
                </td>
                <td className="p-3 text-xs text-gray-600">{(u.modules || []).length} وحدات</td>
                <td className="p-3 text-xs text-gray-500">{formatDate(u.lastLogin)}</td>
                <td className="p-3">
                  <StatusBadge status={u.status} />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Link to={`/dashboard/users/${u.id}`} className={`${actionBtnCls} border-gray-200 text-gray-700 hover:bg-gray-50`}>
                      عرض
                    </Link>
                    <Link
                      to={`/dashboard/users/edit/${u.id}`}
                      className={`${actionBtnCls} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
                    >
                      تعديل
                    </Link>
                    <button
                      onClick={() => toggleStatus(u)}
                      className={`${actionBtnCls} border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100`}
                    >
                      {u.status === "active" ? "تعطيل" : "تفعيل"}
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className={`${actionBtnCls} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
                    >
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
