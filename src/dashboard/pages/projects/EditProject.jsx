import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

const inputCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const cardCls = "bg-white rounded-xl shadow-sm p-5 space-y-4";

function Field({ label, error, hint, className = "", children }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export default function AddProject() {
  const navigate = useNavigate();

  // ref لكل حقل
  const nameRef = useRef();
  const codeRef = useRef();
  const contractNumberRef = useRef();
  const statusRef = useRef();
  const subMunicipalityRef = useRef();
  const startDateRef = useRef();
  const endDateRef = useRef();
  const notesRef = useRef();

  // لازم state لأن الشاشة بتتغير مع قيمتهم
  const [municipalityId, setMunicipalityId] = useState("");
  const [contractorIds, setContractorIds] = useState([]);

  const [municipalities, setMunicipalities] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // الأحياء التابعة للبلدية المختارة
  const subs = municipalities.find((m) => String(m.id) === municipalityId)?.subs ?? [];

  // تحميل البلديات والمقاولين
  useEffect(() => {
    Promise.all([axios.get(`${API_URL}/municipalities`), axios.get(`${API_URL}/contractors`)])
      .then(([municipalitiesRes, contractorsRes]) => {
        setMunicipalities(municipalitiesRes.data);
        setContractors(contractorsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // اختيار / إلغاء اختيار مقاول
  const toggleContractor = (id) => {
    if (contractorIds.includes(id)) {
      setContractorIds(contractorIds.filter((item) => item !== id));
    } else {
      setContractorIds([...contractorIds, id]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const data = {
      name: nameRef.current.value.trim(),
      code: codeRef.current.value,
      contractNumber: contractNumberRef.current.value,
      status: statusRef.current.value,
      municipalityId,
      subMunicipalityId: subMunicipalityRef.current.value,
      contractorIds,
      startDate: startDateRef.current.value,
      endDate: endDateRef.current.value,
      notes: notesRef.current.value,
      createdAt: new Date().toISOString(),
    };

    // التحقق
    const newErrors = {};
    if (!data.name) newErrors.name = "أدخل اسم المشروع";
    if (!data.municipalityId) newErrors.municipalityId = "اختر البلدية";
    if (data.contractorIds.length === 0) newErrors.contractorIds = "اختر مقاولًا واحدًا على الأقل";
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      newErrors.endDate = "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // الحفظ
    setSaving(true);
    setSaveError("");
    try {
      await axios.post(`${API_URL}/projects`, data);
      navigate("/dashboard/projects");
    } catch (err) {
      setSaveError(err.message || "تعذّر حفظ المشروع");
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/projects">المشاريع</Breadcrumb.Link>
        <Breadcrumb.Current>إضافة مشروع</Breadcrumb.Current>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold text-gray-800">إضافة مشروع</h1>
        <p className="text-sm text-gray-500">أدخل بيانات المشروع واربطه بالبلدية والمقاولين. الحقول المعلَّمة بـ * مطلوبة.</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4" aria-busy="true" aria-label="جارٍ التحميل">
          <div className="h-56 rounded-xl bg-gray-100" />
          <div className="h-40 rounded-xl bg-gray-100" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* بيانات المشروع */}
              <section className={cardCls}>
                <h2 className="font-semibold text-gray-800">بيانات المشروع</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="اسم المشروع *" error={errors.name} className="md:col-span-2">
                    <input ref={nameRef} className={inputCls} placeholder="مثال: مشروع نجران" autoFocus />
                  </Field>

                  <Field label="رقم المشروع" hint="اتركه فارغًا ليُولَّد تلقائيًا">
                    <input ref={codeRef} dir="ltr" className={inputCls} placeholder="PRJ-001" />
                  </Field>

                  <Field label="رقم العقد">
                    <input ref={contractNumberRef} dir="ltr" className={inputCls} placeholder="CN-2026-001" />
                  </Field>

                  <Field label="الحالة" className="md:col-span-2">
                    <select ref={statusRef} defaultValue="active" className={inputCls}>
                      <option value="active">نشط</option>
                      <option value="pending">قيد التنفيذ</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </Field>
                </div>
              </section>

              {/* النطاق الإداري */}
              <section className={cardCls}>
                <h2 className="font-semibold text-gray-800">النطاق الإداري</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="البلدية *" error={errors.municipalityId}>
                    <select className={inputCls} value={municipalityId} onChange={(e) => setMunicipalityId(e.target.value)}>
                      <option value="">اختر البلدية</option>
                      {municipalities.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="الفرع / الحي">
                    {/* key بيخلي القائمة تتصفّر لما البلدية تتغير */}
                    <select key={municipalityId} ref={subMunicipalityRef} className={inputCls} disabled={!subs.length}>
                      <option value="">{!municipalityId ? "اختر البلدية أولًا" : subs.length ? "اختر الحي" : "لا توجد أحياء"}</option>
                      {subs.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </section>

              {/* معلومات التنفيذ */}
              <section className={cardCls}>
                <h2 className="font-semibold text-gray-800">معلومات التنفيذ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="تاريخ البداية">
                    <input ref={startDateRef} type="date" className={inputCls} />
                  </Field>

                  <Field label="تاريخ النهاية" error={errors.endDate}>
                    <input ref={endDateRef} type="date" className={inputCls} />
                  </Field>

                  <Field label="ملاحظات" className="md:col-span-2">
                    <textarea ref={notesRef} rows={4} className={inputCls} placeholder="اكتب أي ملاحظات إضافية عن المشروع" />
                  </Field>
                </div>
              </section>
            </div>

            {/* المقاولين */}
            <div>
              <section className={cardCls}>
                <h2 className="font-semibold text-gray-800">المقاولين</h2>
                <p className="text-xs text-gray-400">اختر المقاولين المسند إليهم المشروع.</p>

                {contractors.length === 0 && <p className="text-sm text-gray-400">لا توجد بيانات للمقاولين.</p>}

                {contractors.map((contractor) => {
                  const isSelected = contractorIds.includes(contractor.id);
                  return (
                    <button
                      key={contractor.id}
                      type="button"
                      onClick={() => toggleContractor(contractor.id)}
                      className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-right text-sm ${
                        isSelected ? "border-blue-200 bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                      }`}
                    >
                      <span>{contractor.name}</span>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                          isSelected ? "border-blue-600 bg-blue-600 text-white" : "text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    </button>
                  );
                })}

                {errors.contractorIds && <p className="text-xs text-red-600">{errors.contractorIds}</p>}
              </section>
            </div>
          </div>

          {saveError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</div>}

          {/* الحفظ */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg text-sm"
            >
              {saving ? "جارٍ الحفظ..." : "حفظ المشروع"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/projects")}
              className="border px-6 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}
    </div>
  );
}