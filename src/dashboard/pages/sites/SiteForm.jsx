import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000";

const fetchLookups = () =>
  axios
    .all([axios.get(`${API_URL}/projects`), axios.get(`${API_URL}/sites`), axios.get(`${API_URL}/wasteTypesRef`)])
    .then(([projectsRes, sitesRes, wasteTypesRes]) => ({
      projects: projectsRes?.data ?? [],
      finalDestinations: [
        ...new Map(
          (sitesRes?.data ?? [])
            .filter((site) => site.finalDestinationCode)
            .map((site) => [
              site.finalDestinationCode,
              {
                code: site.finalDestinationCode,
                name: site.nameAr || site.name || site.finalDestinationCode,
              },
            ]),
        ).values(),
      ],
      wasteTypes: wasteTypesRes?.data ?? [],
    }));

const EMPTY = {
  nameAr: "",
  nameEn: "",
  projectId: "",
  finalDestinationCode: "",
  wasteTypeCodes: [],
  totalCapacity: "",
  currentCapacity: 0,
  status: "active",
  lat: "",
  lng: "",
  notes: "",
};

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

const inputCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function SiteForm({ initialData, onSubmit, submitLabel = "حفظ" }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [lookups, setLookups] = useState({ projects: [], finalDestinations: [], wasteTypes: [] });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetchLookups()
      .then(setLookups)
      .catch(() => setLookupError("تعذّر تحميل القوائم. تحقق من تشغيل json-server."));
  }, []);

  useEffect(() => {
    if (initialData) setForm({ ...EMPTY, ...initialData });
  }, [initialData]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleWaste = (code) =>
    set(
      "wasteTypeCodes",
      form.wasteTypeCodes.includes(code) ? form.wasteTypeCodes.filter((c) => c !== code) : [...form.wasteTypeCodes, code],
    );

  const validate = () => {
    const e = {};
    if (!form.nameAr.trim()) e.nameAr = "الاسم بالعربية مطلوب";
    if (!form.projectId) e.projectId = "اختر المشروع";
    if (!form.finalDestinationCode) e.finalDestinationCode = "اختر نقطة التخلص";
    if (form.wasteTypeCodes.length === 0) e.wasteTypeCodes = "اختر نوع نفايات واحد على الأقل";
    if (!form.totalCapacity || Number(form.totalCapacity) <= 0) e.totalCapacity = "السعة الكلية مطلوبة";
    if (Number(form.currentCapacity) > Number(form.totalCapacity)) e.currentCapacity = "السعة الحالية أكبر من الكلية";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSubmitError("");
    onSubmit({
      ...form,
      projectId: Number(form.projectId),
      totalCapacity: Number(form.totalCapacity),
      currentCapacity: Number(form.currentCapacity),
    })
      .then(() => navigate("/dashboard/sites"))
      .catch(() => setSubmitError("تعذّرت إضافة الموقع. تحقق من اتصال json-server ثم حاول مجددًا."))
      .finally(() => setSaving(false));
  };

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-6">
      {lookupError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {lookupError}
        </p>
      )}
      {/* البيانات الأساسية */}
      <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">البيانات الأساسية</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="اسم الموقع (عربي) *" error={errors.nameAr}>
            <input className={inputCls} value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} />
          </Field>
          <Field label="اسم الموقع (English)">
            <input className={inputCls} dir="ltr" value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} />
          </Field>
          <Field label="المشروع *" error={errors.projectId}>
            <select className={inputCls} value={form.projectId} onChange={(e) => set("projectId", e.target.value)}>
              <option value="">اختر...</option>
              {lookups.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="الحالة">
            <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="active">نشط</option>
              <option value="maintenance">صيانة</option>
              <option value="inactive">غير نشط</option>
            </select>
          </Field>
        </div>
      </section>

      {/* الربط مع مدينتي */}
      <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">الربط مع مدينتي</h2>
        <Field label="نقطة التخلص (FinalDestinationCode) *" error={errors.finalDestinationCode}>
          <select className={inputCls} value={form.finalDestinationCode} onChange={(e) => set("finalDestinationCode", e.target.value)}>
            <option value="">اختر من نقاط مدينتي...</option>
            {lookups.finalDestinations.map((d) => (
              <option key={d.code} value={d.code}>
                {d.code} — {d.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">الكود يُجلب من مدينتي ولا يُكتب يدوياً.</p>
        </Field>

        <Field label="أنواع النفايات المسموحة *" error={errors.wasteTypeCodes}>
          {lookups.wasteTypes.length === 0 && <p className="mb-2 text-xs text-gray-500">لا توجد أنواع نفايات متاحة في قاعدة البيانات.</p>}
          <div className="flex flex-wrap gap-3">
            {lookups.wasteTypes.map((w) => (
              <label
                key={w.code}
                className={`cursor-pointer px-4 py-2 rounded-lg border text-sm ${
                  form.wasteTypeCodes.includes(w.code)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={form.wasteTypeCodes.includes(w.code)}
                  onChange={() => toggleWaste(w.code)}
                />
                {w.name}
              </label>
            ))}
          </div>
        </Field>
      </section>

      {/* السعة والموقع الجغرافي */}
      <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">السعة والموقع الجغرافي</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="السعة الكلية (طن) *" error={errors.totalCapacity}>
            <input
              type="number"
              min="0"
              className={inputCls}
              value={form.totalCapacity}
              onChange={(e) => set("totalCapacity", e.target.value)}
            />
          </Field>
          <Field label="السعة الحالية (طن)" error={errors.currentCapacity}>
            <input
              type="number"
              min="0"
              className={inputCls}
              value={form.currentCapacity}
              onChange={(e) => set("currentCapacity", e.target.value)}
            />
          </Field>
          <Field label="خط العرض (Latitude)">
            <input type="number" step="any" dir="ltr" className={inputCls} value={form.lat} onChange={(e) => set("lat", e.target.value)} />
          </Field>
          <Field label="خط الطول (Longitude)">
            <input type="number" step="any" dir="ltr" className={inputCls} value={form.lng} onChange={(e) => set("lng", e.target.value)} />
          </Field>
        </div>
        <Field label="ملاحظات">
          <textarea rows={3} className={inputCls} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </section>

      {submitError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg text-sm"
        >
          {saving ? "جارِ الحفظ..." : submitLabel}
        </button>
        <button type="button" onClick={() => navigate("/dashboard/sites")} className="border px-6 py-2 rounded-lg text-sm hover:bg-gray-50">
          إلغاء
        </button>
      </div>
    </form>
  );
}
