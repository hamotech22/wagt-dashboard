import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000";

const DEFAULT_TYPES = [
  { value: "anpr", label: "ANPR" },
  { value: "weighbridge", label: "ميزان" },
];

const EMPTY = {
  nameAr: "",
  type: "anpr",
  gateId: "",
  connectionId: "",
  ip: "",
  firmware: "",
  installDate: "",
  status: "active",
};

const inputCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const IP_REGEX = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

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

export default function DeviceForm({ initialData, onSubmit, submitLabel = "حفظ" }) {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [lookups, setLookups] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([axios.get(`${API_URL}/gates`), axios.get(`${API_URL}/deviceTypes`)])
      .then(([gates, types]) => setLookups({ gates: gates.data, types: types.data.length ? types.data : DEFAULT_TYPES }))
      .catch(() => setLookups({ gates: [], types: DEFAULT_TYPES }));
  }, []);

  if (!lookups) return null;

  const d = { ...EMPTY, ...initialData };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(formRef.current));

    const e = {};
    if (!data.nameAr.trim()) e.nameAr = "اسم الجهاز مطلوب";
    if (!data.gateId) e.gateId = "اختر البوابة";
    if (!data.connectionId.trim()) e.connectionId = "معرّف الاتصال مطلوب";
    if (data.ip && !IP_REGEX.test(data.ip)) e.ip = "صيغة IP غير صحيحة";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    await onSubmit({ ...initialData, ...data, gateId: Number(data.gateId) });
    setSaving(false);
    navigate("/dashboard/devices");
  };

  return (
    <form key={initialData?.id ?? "new"} ref={formRef} onSubmit={handleSubmit} dir="rtl" className="space-y-6">
      <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">بيانات الجهاز</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="اسم الجهاز *" error={errors.nameAr}>
            <input name="nameAr" defaultValue={d.nameAr} className={inputCls} />
          </Field>
          <Field label="نوع الجهاز *">
            <select name="type" defaultValue={d.type} className={inputCls}>
              {lookups.types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="البوابة *" error={errors.gateId}>
            <select name="gateId" defaultValue={d.gateId} className={inputCls}>
              <option value="">اختر...</option>
              {lookups.gates.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="الحالة">
            <select name="status" defaultValue={d.status} className={inputCls}>
              <option value="active">نشط</option>
              <option value="maintenance">صيانة</option>
              <option value="inactive">غير نشط</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">الاتصال والتقنية</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="معرّف الاتصال (Connection Identifier) *"
            error={errors.connectionId}
            hint="المعرّف الذي يرسله الجهاز مع بياناته، مثل ANPR-NJR-001"
          >
            <input name="connectionId" defaultValue={d.connectionId} dir="ltr" className={inputCls} />
          </Field>
          <Field label="عنوان IP (عند الحاجة)" error={errors.ip}>
            <input name="ip" defaultValue={d.ip} dir="ltr" placeholder="192.168.1.10" className={inputCls} />
          </Field>
          <Field label="إصدار Firmware (عند توفره)">
            <input name="firmware" defaultValue={d.firmware} dir="ltr" className={inputCls} />
          </Field>
          <Field label="تاريخ التركيب">
            <input name="installDate" defaultValue={d.installDate} type="date" className={inputCls} />
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
          onClick={() => navigate("/dashboard/devices")}
          className="border px-6 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
