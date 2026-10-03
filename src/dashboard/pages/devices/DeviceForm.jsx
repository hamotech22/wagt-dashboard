import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000";

const fetchDeviceLookups = () =>
  axios
    .all([axios.get(`${API_URL}/gates`), axios.get(`${API_URL}/deviceTypes`)])
    .then(([gatesRes, typesRes]) => ({
      gates: gatesRes?.data ?? [],
      types: typesRes?.data?.length
        ? typesRes.data
        : [
            { value: "anpr", label: "ANPR" },
            { value: "weighbridge", label: "ميزان" },
          ],
    }))
    .catch(() => ({
      gates: [],
      types: [
        { value: "anpr", label: "ANPR" },
        { value: "weighbridge", label: "ميزان" },
      ],
    }));

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
  const [form, setForm] = useState(EMPTY);
  const [lookups, setLookups] = useState({ gates: [], types: [] });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDeviceLookups().then(setLookups);
  }, []);

  useEffect(() => {
    if (initialData) setForm({ ...EMPTY, ...initialData });
  }, [initialData]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.nameAr.trim()) e.nameAr = "اسم الجهاز مطلوب";
    if (!form.gateId) e.gateId = "اختر البوابة";
    if (!form.connectionId.trim()) e.connectionId = "معرّف الاتصال مطلوب";
    if (form.ip && !IP_REGEX.test(form.ip)) e.ip = "صيغة IP غير صحيحة";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await onSubmit({ ...form, gateId: Number(form.gateId) });
    setSaving(false);
    navigate("/dashboard/devices");
  };

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-6">
      <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">بيانات الجهاز</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="اسم الجهاز *" error={errors.nameAr}>
            <input className={inputCls} value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} />
          </Field>
          <Field label="نوع الجهاز *">
            <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
              {lookups.types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="البوابة *" error={errors.gateId}>
            <select className={inputCls} value={form.gateId} onChange={(e) => set("gateId", e.target.value)}>
              <option value="">اختر...</option>
              {lookups.gates.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
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

      <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">الاتصال والتقنية</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="معرّف الاتصال (Connection Identifier) *"
            error={errors.connectionId}
            hint="المعرّف الذي يرسله الجهاز مع بياناته، مثل ANPR-NJR-001"
          >
            <input dir="ltr" className={inputCls} value={form.connectionId} onChange={(e) => set("connectionId", e.target.value)} />
          </Field>
          <Field label="عنوان IP (عند الحاجة)" error={errors.ip}>
            <input dir="ltr" placeholder="192.168.1.10" className={inputCls} value={form.ip} onChange={(e) => set("ip", e.target.value)} />
          </Field>
          <Field label="إصدار Firmware (عند توفره)">
            <input dir="ltr" className={inputCls} value={form.firmware} onChange={(e) => set("firmware", e.target.value)} />
          </Field>
          <Field label="تاريخ التركيب">
            <input type="date" className={inputCls} value={form.installDate} onChange={(e) => set("installDate", e.target.value)} />
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
