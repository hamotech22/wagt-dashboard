import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATUS_OPTIONS, countPerms } from "./UserBadges";

const API_URL = "http://localhost:3000";

export const MODULES = [
  { key: "dashboard", label: "لوحة التحكم", icon: "📊", available: true },
  { key: "smart_gates", label: "البوابات الذكية", icon: "🚪", available: true },
  { key: "sites", label: "المواقع", icon: "📍", available: true },
  { key: "transactions", label: "العمليات", icon: "📦", available: true },
  { key: "reports", label: "التقارير", icon: "📈", available: true },
  { key: "users", label: "المستخدمون", icon: "👥", available: true },
];

export const SCOPE_LEVELS = [
  { value: "tenant", label: "المؤسسة", hint: "كل المؤسسة", source: null },
  { value: "region", label: "المنطقة", hint: "المنطقة", source: "regions" },
  { value: "city", label: "المدينة", hint: "المدينة", source: "cities" },
  { value: "project", label: "المشروع", hint: "المشروع", source: "projects" },
  { value: "site", label: "الموقع", hint: "الموقع", source: "sites" },
];

const fetchUserLookups = () =>
  axios
    .all([
      axios.get(`${API_URL}/roles`),
      axios.get(`${API_URL}/projects`),
      axios.get(`${API_URL}/sites`),
      axios.get(`${API_URL}/municipalities`),
    ])
    .then(([rolesRes, projectsRes, sitesRes, municipalitiesRes]) => ({
      roles: rolesRes?.data ?? [],
      projects: projectsRes?.data ?? [],
      sites: sitesRes?.data ?? [],
      municipalities: municipalitiesRes?.data ?? [],
      regions: municipalitiesRes?.data ?? [],
      cities: municipalitiesRes?.data ?? [],
    }))
    .catch(() => ({ roles: [], projects: [], sites: [], municipalities: [], regions: [], cities: [] }));

const EMPTY = {
  fullName: "",
  username: "",
  email: "",
  phone: "",
  roleId: "",
  status: "active",
  mfaEnabled: false,
  password: "",
  confirmPassword: "",
  scopeLevel: "tenant",
  scopeIds: [],
  modules: ["smart_gates"],
};

const inputCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,}$/;

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export default function UserForm({ initialData, onSubmit, submitLabel = "حفظ" }) {
  const navigate = useNavigate();
  const isEdit = !!initialData;
  const [form, setForm] = useState(EMPTY);
  const [lookups, setLookups] = useState({ roles: [] });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserLookups().then(setLookups);
  }, []);

  useEffect(() => {
    if (initialData) setForm({ ...EMPTY, ...initialData, password: "", confirmPassword: "" });
  }, [initialData]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const level = SCOPE_LEVELS.find((l) => l.value === form.scopeLevel);
  const scopeOptions = level?.source ? lookups[level.source] || [] : [];
  const role = lookups.roles.find((r) => r.id === Number(form.roleId));

  const changeLevel = (v) => setForm((f) => ({ ...f, scopeLevel: v, scopeIds: [] }));

  const toggle = (key, value) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "الاسم الكامل مطلوب";
    if (!form.username.trim()) e.username = "اسم المستخدم مطلوب";
    else if (!USERNAME_REGEX.test(form.username)) e.username = "3 أحرف على الأقل، حروف إنجليزية وأرقام و . _ - فقط";
    if (!form.email.trim()) e.email = "البريد الإلكتروني مطلوب";
    else if (!EMAIL_REGEX.test(form.email)) e.email = "صيغة البريد غير صحيحة";
    if (!form.roleId) e.roleId = "اختر الدور";

    if (!isEdit || form.password) {
      if (form.password.length < 8) e.password = "كلمة المرور 8 أحرف على الأقل";
      else if (form.password !== form.confirmPassword) e.confirmPassword = "كلمتا المرور غير متطابقتين";
    }

    if (level?.source && form.scopeIds.length === 0) e.scopeIds = `اختر ${level.hint} على الأقل`;
    if (form.modules.length === 0) e.modules = "اختر وحدة واحدة على الأقل";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const { confirmPassword, ...payload } = form;
    if (!payload.password) delete payload.password;
    await onSubmit({ ...payload, roleId: Number(form.roleId) });
    setSaving(false);
    navigate("/dashboard/users");
  };

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-6">
      {/* ---------- الهوية ---------- */}
      <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">بيانات المستخدم</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="الاسم الكامل *" error={errors.fullName}>
            <input className={inputCls} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
          </Field>
          <Field label="اسم المستخدم *" error={errors.username} hint="يُستخدم لتسجيل الدخول">
            <input dir="ltr" className={inputCls} value={form.username} onChange={(e) => set("username", e.target.value)} />
          </Field>
          <Field label="البريد الإلكتروني *" error={errors.email}>
            <input dir="ltr" type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="رقم الجوال">
            <input
              dir="ltr"
              placeholder="05xxxxxxxx"
              className={inputCls}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="الحالة">
            <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* ---------- الأمان ---------- */}
      <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">كلمة المرور والأمان</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={isEdit ? "كلمة مرور جديدة" : "كلمة المرور *"}
            error={errors.password}
            hint={isEdit ? "اتركها فارغة للإبقاء على كلمة المرور الحالية" : "8 أحرف على الأقل"}
          >
            <input
              dir="ltr"
              type="password"
              autoComplete="new-password"
              className={inputCls}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </Field>
          <Field label="تأكيد كلمة المرور" error={errors.confirmPassword}>
            <input
              dir="ltr"
              type="password"
              autoComplete="new-password"
              className={inputCls}
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={form.mfaEnabled} onChange={(e) => set("mfaEnabled", e.target.checked)} />
          تفعيل المصادقة متعددة العوامل (MFA)
        </label>
      </section>

      {/* ---------- الدور ---------- */}
      <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-800">الدور (ماذا يستطيع أن يفعل)</h2>
          <p className="text-xs text-gray-400 mt-1">الدور يحدد الإجراءات المسموحة: عرض، إضافة، تعديل، حذف، اعتماد...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="الدور *" error={errors.roleId}>
            <select className={inputCls} value={form.roleId} onChange={(e) => set("roleId", e.target.value)}>
              <option value="">اختر...</option>
              {lookups.roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nameAr}
                </option>
              ))}
            </select>
          </Field>
          {role && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              <div>{role.description || "بدون وصف"}</div>
              <div className="text-xs text-gray-400 mt-1">{countPerms(role)} صلاحية ممنوحة</div>
            </div>
          )}
        </div>
      </section>

      {/* ---------- نطاق البيانات ---------- */}
      <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-800">نطاق البيانات (ما الذي يراه)</h2>
          <p className="text-xs text-gray-400 mt-1">يرى المستخدم البيانات الواقعة ضمن هذا النطاق فقط</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="مستوى النطاق *">
            <select className={inputCls} value={form.scopeLevel} onChange={(e) => changeLevel(e.target.value)}>
              {SCOPE_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label} — {l.hint}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {level?.source && (
          <Field label={`${level.label} *`} error={errors.scopeIds}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {scopeOptions.map((o) => (
                <label
                  key={o.id}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer ${
                    form.scopeIds.includes(o.id) ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <input type="checkbox" checked={form.scopeIds.includes(o.id)} onChange={() => toggle("scopeIds", o.id)} />
                  {o.name}
                </label>
              ))}
            </div>
          </Field>
        )}
      </section>

      {/* ---------- الوحدات ---------- */}
      <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-800">الوصول للوحدات (أين يستطيع الدخول)</h2>
          <p className="text-xs text-gray-400 mt-1">حساب واحد، وتظهر له اللوحات المصرّح بها فقط</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {MODULES.map((m) => (
            <label
              key={m.key}
              className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm ${
                !m.available
                  ? "opacity-50 cursor-not-allowed bg-gray-50"
                  : form.modules.includes(m.key)
                    ? "border-blue-500 bg-blue-50 cursor-pointer"
                    : "hover:bg-gray-50 cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                disabled={!m.available}
                checked={form.modules.includes(m.key)}
                onChange={() => toggle("modules", m.key)}
              />
              <span>{m.icon}</span>
              <span>{m.label}</span>
              {!m.available && <span className="mr-auto text-xs text-gray-400">قريباً</span>}
            </label>
          ))}
        </div>
        {errors.modules && <p className="text-xs text-red-600">{errors.modules}</p>}
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg text-sm"
        >
          {saving ? "جارِ الحفظ..." : submitLabel}
        </button>
        <button type="button" onClick={() => navigate("/dashboard/users")} className="border px-6 py-2 rounded-lg text-sm hover:bg-gray-50">
          إلغاء
        </button>
      </div>
    </form>
  );
}
