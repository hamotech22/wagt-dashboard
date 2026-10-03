import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlateBadge } from "./VehicleBadges";
import { VEHICLE_TYPES } from "./vehicleTypes";

const API_URL = "http://localhost:3000";

const fetchVehicleLookups = () =>
  axios
    .all([axios.get(`${API_URL}/contractors`), axios.get(`${API_URL}/projects`)])
    .then(([contractorsRes, projectsRes]) => ({
      types: VEHICLE_TYPES,
      contractors: contractorsRes?.data ?? [],
      projects: projectsRes?.data ?? [],
    }))
    .catch(() => ({ types: VEHICLE_TYPES, contractors: [], projects: [] }));

const EMPTY = {
  plateNumber: "",
  plateChars: "",
  type: "truck",
  contractorId: "",
  projectId: "",
  status: "active",
};

const inputCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

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

export default function VehicleForm({ initialData, onSubmit, submitLabel = "حفظ" }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [lookups, setLookups] = useState({ types: [], contractors: [], projects: [] });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVehicleLookups().then(setLookups);
  }, []);

  useEffect(() => {
    if (initialData)
      setForm({
        ...EMPTY,
        ...initialData,
        contractorId: initialData.contractorId ?? "",
        projectId: initialData.projectId ?? "",
      });
  }, [initialData]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // المشاريع المتاحة = مشاريع المقاول المختار فقط
  const availableProjects = useMemo(
    () => (form.contractorId ? lookups.projects.filter((p) => p.contractorIds.includes(Number(form.contractorId))) : []),
    [lookups.projects, form.contractorId],
  );

  const changeContractor = (v) => setForm((f) => ({ ...f, contractorId: v, projectId: "" }));

  const validate = () => {
    const e = {};
    if (!/^\d{1,4}$/.test(form.plateNumber)) e.plateNumber = "أرقام فقط (1 إلى 4 خانات)";
    if (!/^[\u0600-\u06FFA-Za-z\s]{1,7}$/.test(form.plateChars.trim())) e.plateChars = "حروف فقط (حتى 3 حروف)";
    if (form.projectId && !form.contractorId) e.contractorId = "اختر المقاول أولاً";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await onSubmit({
      ...form,
      plateChars: form.plateChars.trim(),
      contractorId: form.contractorId ? Number(form.contractorId) : null,
      projectId: form.projectId ? Number(form.projectId) : null,
    });
    setSaving(false);
    navigate("/dashboard/vehicles");
  };

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-6">
      <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">بيانات اللوحة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="أرقام اللوحة *" error={errors.plateNumber}>
            <input
              dir="ltr"
              maxLength={4}
              className={inputCls}
              value={form.plateNumber}
              onChange={(e) => set("plateNumber", e.target.value)}
            />
          </Field>
          <Field label="حروف اللوحة *" error={errors.plateChars} hint="مثال: أ ب ج">
            <input maxLength={7} className={inputCls} value={form.plateChars} onChange={(e) => set("plateChars", e.target.value)} />
          </Field>
        </div>
        {(form.plateNumber || form.plateChars) && (
          <div>
            <div className="text-xs text-gray-400 mb-2">معاينة</div>
            <PlateBadge number={form.plateNumber || "----"} chars={form.plateChars || "---"} size="lg" />
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">بيانات المركبة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="نوع المركبة">
            <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
              {lookups.types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="الحالة">
            <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="active">نشطة</option>
              <option value="pending">بانتظار المراجعة</option>
              <option value="suspended">موقوفة</option>
              <option value="inactive">غير نشطة</option>
            </select>
          </Field>
          <Field label="المقاول" error={errors.contractorId}>
            <select className={inputCls} value={form.contractorId} onChange={(e) => changeContractor(e.target.value)}>
              <option value="">غير مرتبطة</option>
              {lookups.contractors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="المشروع" hint={!form.contractorId ? "اختر المقاول لعرض مشاريعه" : ""}>
            <select
              className={inputCls}
              value={form.projectId}
              disabled={!form.contractorId}
              onChange={(e) => set("projectId", e.target.value)}
            >
              <option value="">اختر...</option>
              {availableProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg text-sm"
        >
          {saving ? "جارِ الحفظ..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => navigate("/dashboard/vehicles")}
          className="border px-6 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
