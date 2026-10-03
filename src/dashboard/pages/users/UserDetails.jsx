import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge, MfaBadge, Avatar, formatDate, scopeText } from "./UserBadges";

const API_URL = "http://localhost:3000";
const ACTIONS = [
  { key: "view", label: "عرض" },
  { key: "create", label: "إضافة" },
  { key: "update", label: "تعديل" },
  { key: "delete", label: "حذف" },
  { key: "approve", label: "اعتماد" },
];
const RESOURCES = [
  { key: "dashboard", label: "لوحة التحكم", group: "عام" },
  { key: "gates", label: "البوابات", group: "المعالجة" },
  { key: "sites", label: "المواقع", group: "المعالجة" },
  { key: "transactions", label: "العمليات", group: "المعالجة" },
  { key: "users", label: "المستخدمون", group: "إدارة" },
];
const MODULES = [
  { key: "dashboard", label: "لوحة التحكم", icon: "📊", available: true },
  { key: "smart_gates", label: "البوابات الذكية", icon: "🚪", available: true },
  { key: "sites", label: "المواقع", icon: "📍", available: true },
  { key: "transactions", label: "العمليات", icon: "📦", available: true },
  { key: "reports", label: "التقارير", icon: "📈", available: true },
  { key: "users", label: "المستخدمون", icon: "👥", available: true },
];
const fetchUser = (id) =>
  axios
    .get(`${API_URL}/users/${id}`)
    .then((response) => response.data)
    .catch(() => null);
const fetchUserLookups = () =>
  axios
    .get(`${API_URL}/roles`)
    .then((response) => ({ roles: response.data }))
    .catch(() => ({ roles: [] }));

function Item({ label, children }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-sm text-gray-800">{children || "-"}</div>
    </div>
  );
}

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [lookups, setLookups] = useState({ roles: [] });

  useEffect(() => {
    Promise.all([fetchUser(id), fetchUserLookups()]).then(([u, l]) => {
      setUser(u);
      setLookups(l);
    });
  }, [id]);

  if (!user) return <div className="p-6 text-gray-400">جارِ التحميل...</div>;

  const role = lookups.roles.find((r) => r.id === user.roleId);
  const actionLabel = (k) => ACTIONS.find((a) => a.key === k)?.label;
  const granted = RESOURCES.filter((r) => role?.permissions?.[r.key]?.length);

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={user.fullName} size="w-14 h-14 text-lg" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{user.fullName}</h1>
            <p className="text-sm text-gray-400" dir="ltr">
              @{user.username}
            </p>
          </div>
          <StatusBadge status={user.status} />
        </div>
        <div className="flex gap-2">
          <Link to={`/dashboard/users/edit/${user.id}`} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
            تعديل
          </Link>
          <Link to="/dashboard/users" className="border px-4 py-2 rounded-lg text-sm">
            رجوع
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5 grid grid-cols-2 gap-5">
          <h3 className="col-span-2 font-semibold text-gray-800">معلومات الحساب</h3>
          <Item label="البريد الإلكتروني">
            <span dir="ltr">{user.email}</span>
          </Item>
          <Item label="رقم الجوال">
            <span dir="ltr">{user.phone}</span>
          </Item>
          <Item label="المصادقة متعددة العوامل">
            <MfaBadge enabled={user.mfaEnabled} />
          </Item>
          <Item label="آخر دخول">{formatDate(user.lastLogin)}</Item>
          <Item label="تاريخ الإنشاء">{formatDate(user.createdAt, false)}</Item>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 grid grid-cols-2 gap-5">
          <h3 className="col-span-2 font-semibold text-gray-800">الدور ونطاق البيانات</h3>
          <Item label="الدور">
            {role && (
              <Link to={`/dashboard/permissions?role=${role.id}`} className="text-blue-600 hover:underline">
                {role.nameAr}
              </Link>
            )}
          </Item>
          <Item label="نطاق البيانات">{scopeText(user, lookups)}</Item>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
          <h3 className="font-semibold text-gray-800">الوصول للوحدات</h3>
          <ul className="space-y-2 text-sm">
            {MODULES.map((m) => {
              const on = user.modules.includes(m.key);
              return (
                <li key={m.key} className={`flex items-center gap-2 ${on ? "text-gray-800" : "text-gray-400"}`}>
                  <span className={on ? "text-green-600" : "text-red-400"}>{on ? "✓" : "✗"}</span>
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                  {!m.available && <span className="text-xs text-gray-400">(قريباً)</span>}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">الصلاحيات الفعلية (من الدور)</h3>
            {role && (
              <Link to={`/dashboard/permissions?role=${role.id}`} className="text-xs text-blue-600 hover:underline">
                تعديل صلاحيات الدور
              </Link>
            )}
          </div>
          {granted.length === 0 && <p className="text-sm text-gray-400">لا توجد صلاحيات ممنوحة</p>}
          <ul className="space-y-2.5">
            {granted.map((r) => (
              <li key={r.key} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-gray-700 w-40 shrink-0">{r.label}</span>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions[r.key].map((a) => (
                    <span key={a} className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">
                      {actionLabel(a)}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
