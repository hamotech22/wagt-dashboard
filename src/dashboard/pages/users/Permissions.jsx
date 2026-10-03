import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_URL = "http://localhost:3000";
const ACTIONS = [
  { key: "view", label: "عرض" },
  { key: "create", label: "إضافة" },
  { key: "update", label: "تعديل" },
  { key: "delete", label: "حذف" },
  { key: "approve", label: "اعتماد" },
];
const RESOURCES = [
  { key: "dashboard", label: "لوحة التحكم", group: "عام", actions: ["view"] },
  { key: "gates", label: "البوابات", group: "المعالجة", actions: ["view", "create", "update", "delete"] },
  { key: "sites", label: "المواقع", group: "المعالجة", actions: ["view", "create", "update", "delete"] },
  { key: "transactions", label: "العمليات", group: "المعالجة", actions: ["view", "create", "update", "delete", "approve"] },
  { key: "users", label: "المستخدمون", group: "إدارة", actions: ["view", "create", "update", "delete"] },
];

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
const updateRole = (id, payload) => axios.put(`${API_URL}/roles/${id}`, { ...payload, id }).then((response) => response.data);

const GROUPS = [...new Set(RESOURCES.map((r) => r.group))];

// يضمن ترتيباً ثابتاً ويحذف أي إجراء غير مدعوم في المورد
const normalize = (p) =>
  Object.fromEntries(
    RESOURCES.map((r) => [r.key, ACTIONS.map((a) => a.key).filter((k) => r.actions.includes(k) && (p?.[r.key] || []).includes(k))]),
  );

export default function Permissions() {
  const [params, setParams] = useSearchParams();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [perms, setPerms] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const load = async () => {
    const [r, u] = await Promise.all([fetchRoles(), fetchUsers()]);
    setRoles(r);
    setUsers(u);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const roleId = Number(params.get("role")) || roles[0]?.id;
  const role = roles.find((r) => r.id === roleId);

  useEffect(() => {
    if (role) setPerms(normalize(role.permissions));
  }, [role]);

  const original = useMemo(() => JSON.stringify(normalize(role?.permissions)), [role]);
  const dirty = JSON.stringify(perms) !== original;
  const locked = !!role?.locked;
  const affectedUsers = users.filter((u) => u.roleId === roleId).length;
  const total = Object.values(perms).reduce((s, a) => s + a.length, 0);

  const selectRole = (id) => {
    if (dirty && !window.confirm("لديك تغييرات غير محفوظة، هل تريد تجاهلها؟")) return;
    setParams({ role: id });
    setSavedAt(null);
  };

  const toggle = (rKey, aKey) => {
    if (locked) return;
    setPerms((p) => {
      const has = p[rKey].includes(aKey);
      const next = has ? p[rKey].filter((x) => x !== aKey) : [...p[rKey], aKey];
      return normalize({ ...p, [rKey]: next });
    });
  };

  const toggleRow = (res) => {
    if (locked) return;
    setPerms((p) => ({ ...p, [res.key]: p[res.key].length === res.actions.length ? [] : normalize({ [res.key]: res.actions })[res.key] }));
  };

  const toggleColumn = (aKey) => {
    if (locked) return;
    const applicable = RESOURCES.filter((r) => r.actions.includes(aKey));
    const allOn = applicable.every((r) => perms[r.key]?.includes(aKey));
    setPerms((p) => {
      const next = { ...p };
      applicable.forEach((r) => {
        next[r.key] = allOn ? p[r.key].filter((x) => x !== aKey) : [...p[r.key], aKey];
      });
      return normalize(next);
    });
  };

  const save = async () => {
    setSaving(true);
    await updateRole(roleId, { permissions: perms });
    await load();
    setSaving(false);
    setSavedAt(new Date());
  };

  if (loading) return <div className="p-6 text-gray-400">جارِ التحميل...</div>;
  if (!role) return <div className="p-6 text-gray-400">لا توجد أدوار</div>;

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">صلاحيات الأدوار</h1>
          <p className="text-sm text-gray-500">حدّد ما يستطيع كل دور فعله داخل المنصة</p>
        </div>
        <Link to="/dashboard/roles" className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
          إدارة الأدوار
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">الدور:</label>
          <select value={roleId} onChange={(e) => selectRole(e.target.value)} className="border rounded-lg px-3 py-2 text-sm min-w-[200px]">
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nameAr}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-500">
          {total} صلاحية · يؤثر على <span className="font-medium text-gray-800">{affectedUsers}</span> مستخدم
        </div>
        {role.description && <div className="text-xs text-gray-400 w-full">{role.description}</div>}
      </div>

      {locked && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg px-4 py-3">
          هذا الدور محمي ولا يمكن تعديل صلاحياته حتى لا يفقد النظام حساب الإدارة الكاملة.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 min-w-[180px]">المورد</th>
              {ACTIONS.map((a) => (
                <th key={a.key} className="p-3 text-center whitespace-nowrap">
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => toggleColumn(a.key)}
                    title="تحديد/إلغاء العمود كله"
                    className="font-medium hover:text-blue-600 disabled:hover:text-gray-600"
                  >
                    {a.label}
                  </button>
                </th>
              ))}
              <th className="p-3 text-center">الكل</th>
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((g) => (
              <GroupRows key={g} group={g} perms={perms} locked={locked} toggle={toggle} toggleRow={toggleRow} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={!dirty || saving || locked}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm"
        >
          {saving ? "جارِ الحفظ..." : "حفظ الصلاحيات"}
        </button>
        {dirty && (
          <button onClick={() => setPerms(normalize(role.permissions))} className="border px-6 py-2 rounded-lg text-sm hover:bg-gray-50">
            تراجع
          </button>
        )}
        {dirty && <span className="text-xs text-yellow-600">توجد تغييرات غير محفوظة</span>}
        {!dirty && savedAt && <span className="text-xs text-green-600">تم الحفظ</span>}
      </div>
    </div>
  );
}

function GroupRows({ group, perms, locked, toggle, toggleRow }) {
  const rows = RESOURCES.filter((r) => r.group === group);
  return (
    <>
      <tr className="bg-gray-50/70 border-t">
        <td colSpan={ACTIONS.length + 2} className="px-3 py-2 text-xs font-semibold text-gray-500">
          {group}
        </td>
      </tr>
      {rows.map((r) => (
        <tr key={r.key} className="border-t hover:bg-gray-50">
          <td className="p-3 text-gray-800">{r.label}</td>
          {ACTIONS.map((a) => (
            <td key={a.key} className="p-3 text-center">
              {r.actions.includes(a.key) ? (
                <input
                  type="checkbox"
                  disabled={locked}
                  checked={perms[r.key]?.includes(a.key) || false}
                  onChange={() => toggle(r.key, a.key)}
                  aria-label={`${r.label} - ${a.label}`}
                />
              ) : (
                <span className="text-gray-300">–</span>
              )}
            </td>
          ))}
          <td className="p-3 text-center">
            <input
              type="checkbox"
              disabled={locked}
              checked={(perms[r.key]?.length || 0) === r.actions.length}
              onChange={() => toggleRow(r)}
              aria-label={`${r.label} - الكل`}
            />
          </td>
        </tr>
      ))}
    </>
  );
}
