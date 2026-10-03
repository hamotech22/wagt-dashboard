import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000";

const inputCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

// القيم الافتراضية لو السيرفر مردش
const DEFAULT_TYPES = [
  { value: "weighbridge", label: "ميزان" },
  { value: "camera", label: "كاميرا" },
];
const DEFAULT_DIRECTIONS = [
  { value: "in", label: "إدخال" },
  { value: "out", label: "خروج" },
];

// القيم الابتدائية للفورم
const EMPTY = {
  nameAr: "",
  siteId: "",
  type: "weighbridge",
  direction: "in",
  status: "active",
  integration: { autoSubmit: true, maxRetries: 5 },
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

export default function GateForm({ initialData, onSubmit, submitLabel = "حفظ" }) {
  const navigate = useNavigate();

  // ref لكل حقل
  const nameRef = useRef();
  const siteRef = useRef();
  const typeRef = useRef();
  const directionRef = useRef();
  const statusRef = useRef();
  const autoSubmitRef = useRef();
  const maxRetriesRef = useRef();

  const [lookups, setLookups] = useState(null); // null = لسه بيحمل
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // تحميل القوائم (المواقع - الأنواع - الاتجاهات)
  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/sites`),
      axios.get(`${API_URL}/gateTypes`),
      axios.get(`${API_URL}/gateDirections`),
    ])
      .then(([sites, types, directions]) =>
        setLookups({
          sites: sites.data,
          types: types.data.length ? types.data : DEFAULT_TYPES,
          directions: directions.data.length ? directions.data : DEFAULT_DIRECTIONS,
        }),
      )
      .catch(() => setLookups({ sites: [], types: DEFAULT_TYPES, directions: DEFAULT_DIRECTIONS }));
  }, []);

  if (!lookups) return <p>جارِ التحميل...</p>;

  // دمج البيانات الابتدائية مع القيم الافتراضية
  const d = { ...EMPTY, ...initialData };
  const integration = { ...EMPTY.integration, ...initialData?.integration };

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    const nameAr = nameRef.current.value.trim();
    const siteId = siteRef.current.value;
    const maxRetries = Number(maxRetriesRef.current.value);

    // التحقق
    const newErrors = {};
    if (!nameAr) newErrors.nameAr = "اسم البوابة مطلوب";
    if (!siteId) newErrors.siteId = "اختر الموقع";
    if (maxRetries < 0 || maxRetries > 20) newErrors.maxRetries = "القيمة بين 0 و 20";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // جمع البيانات وإرسالها
    setSaving(true);
    await onSubmit({
      ...initialData,
      nameAr,
      siteId: Number(siteId),
      type: typeRef.current.value,
      direction: directionRef.current.value,
      status: statusRef.current.value,
      integration: {
        autoSubmit: autoSubmitRef.current.checked,
        maxRetries,
      },
    });
    setSaving(false);
    navigate("/dashboard/gates");
  };

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-6">
      <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">بيانات البوابة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="اسم البوابة *" error={errors.nameAr}>
            <input ref={nameRef} defaultValue={d.nameAr} className={inputCls} />
          </Field>

          <Field label="الموقع *" error={errors.siteId}>
            <select ref={siteRef} defaultValue={d.siteId} className={inputCls}>
              <option value="">اختر...</option>
              {lookups.sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>

          <Field label="نوع البوابة">
            <select ref={typeRef} defaultValue={d.type} className={inputCls}>
              {lookups.types.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>

          <Field label="الاتجاه">
            <select ref={directionRef} defaultValue={d.direction} className={inputCls}>
              {lookups.directions.map((dir) => (
                <option key={dir.value} value={dir.value}>{dir.label}</option>
              ))}
            </select>
          </Field>

          <Field label="الحالة">
            <select ref={statusRef} defaultValue={d.status} className={inputCls}>
              <option value="active">نشطة</option>
              <option value="maintenance">صيانة</option>
              <option value="inactive">غير نشطة</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">إعدادات التكامل مع مدينتي</h2>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" ref={autoSubmitRef} defaultChecked={integration.autoSubmit} className="w-4 h-4" />
          <span className="text-sm text-gray-700">إرسال العمليات تلقائياً عند اكتمالها</span>
        </label>

        <div className="max-w-xs">
          <Field label="عدد محاولات إعادة الإرسال" error={errors.maxRetries}>
            <input
              type="number"
              min="0"
              max="20"
              ref={maxRetriesRef}
              defaultValue={integration.maxRetries}
              className={inputCls}
            />
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
        <button type="button" onClick={() => navigate("/dashboard/gates")} className="border px-6 py-2 rounded-lg text-sm hover:bg-gray-50">
          إلغاء
        </button>
      </div>
    </form>
  );
}