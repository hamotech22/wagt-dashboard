import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

const inputCls =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";
const cardCls = "rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70";
const cardHeaderCls = "border-b border-slate-100 px-6 py-4";
const labelCls = "mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700";
const hintCls = "mt-1 block text-xs text-slate-500";
const errorCls = "mt-1 block text-xs text-red-600";

export default function AddProject() {
  const navigate = useNavigate();

  // ref لكل حقل نصي
  const nameRef = useRef();
  const codeRef = useRef();
  const contractNumberRef = useRef();
  const statusRef = useRef();
  const subMunicipalityRef = useRef();
  const startDateRef = useRef();
  const endDateRef = useRef();
  const notesRef = useRef();

  // دول لازم يفضلوا state لأن الشاشة بتتغير لما قيمتهم تتغير
  const [municipalityId, setMunicipalityId] = useState(""); // عشان قائمة الأحياء تتغير
  const [contractorIds, setContractorIds] = useState([]); // عشان زرار المقاول يتلون

  const [municipalities, setMunicipalities] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // الأحياء التابعة للبلدية المختارة
  const subs = municipalities.find((m) => String(m.id) === String(municipalityId))?.subs ?? [];

  // تحميل البلديات والمقاولين أول ما الصفحة تفتح
  useEffect(() => {
    Promise.all([axios.get(`${API_URL}/municipalities`), axios.get(`${API_URL}/contractors`)])
      .then(([municipalitiesRes, contractorsRes]) => {
        setMunicipalities(municipalitiesRes.data);
        setContractors(contractorsRes.data);
      })
      .catch(() => {}) // لو حصل خطأ هتفضل القوائم فاضية
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

    // نقرا القيم من الـ refs
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
    <div className="p-6">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/projects">المشاريع</Breadcrumb.Link>
        <Breadcrumb.Current>إضافة مشروع</Breadcrumb.Current>
      </Breadcrumb>
      <h1 className="text-xl font-bold text-slate-900">إضافة مشروع</h1>
      <p className="mt-1 text-sm text-slate-500">أدخل بيانات المشروع واربطه بالبلدية والمقاولين. الحقول المعلَّمة بـ * مطلوبة.</p>

      {loading && (
        <div className="mt-6 animate-pulse space-y-4" aria-busy="true" aria-label="جارٍ التحميل">
          <div className="h-56 rounded-xl bg-slate-100" />
          <div className="h-40 rounded-xl bg-slate-100" />
        </div>
      )}

      {!loading && (
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {/* بيانات المشروع */}
              <section className={cardCls}>
                <header className={cardHeaderCls}>
                  <h2 className="font-semibold text-slate-900">بيانات المشروع</h2>
                </header>
                <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className={labelCls}>
                      اسم المشروع <span className="text-red-500">*</span>
                    </span>
                    <input ref={nameRef} className={inputCls} placeholder="مثال: مشروع نجران" autoFocus />
                    {errors.name && <span className={errorCls}>{errors.name}</span>}
                  </label>

                  <label className="block">
                    <span className={labelCls}>رقم المشروع</span>
                    <input ref={codeRef} className={inputCls} dir="ltr" placeholder="PRJ-001" />
                    <span className={hintCls}>اتركه فارغًا ليُولَّد تلقائيًا</span>
                  </label>

                  <label className="block">
                    <span className={labelCls}>رقم العقد</span>
                    <input ref={contractNumberRef} className={inputCls} dir="ltr" placeholder="CN-2026-001" />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className={labelCls}>الحالة</span>
                    <select ref={statusRef} defaultValue="active" className={inputCls}>
                      <option value="active">نشط</option>
                      <option value="pending">قيد التنفيذ</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </label>
                </div>
              </section>

              {/* النطاق الإداري */}
              <section className={cardCls}>
                <header className={cardHeaderCls}>
                  <h2 className="font-semibold text-slate-900">النطاق الإداري</h2>
                  <p className="mt-0.5 text-sm text-slate-500">البلدية التي يتبع لها المشروع.</p>
                </header>
                <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
                  <label className="block">
                    <span className={labelCls}>
                      البلدية <span className="text-red-500">*</span>
                    </span>
                    <select
                      className={inputCls}
                      value={municipalityId}
                      onChange={(event) => setMunicipalityId(event.target.value)}
                    >
                      <option value="">اختر البلدية</option>
                      {municipalities.map((municipality) => (
                        <option key={municipality.id} value={municipality.id}>
                          {municipality.name}
                        </option>
                      ))}
                    </select>
                    {errors.municipalityId && <span className={errorCls}>{errors.municipalityId}</span>}
                  </label>

                  <label className="block">
                    <span className={labelCls}>الفرع / الحي</span>
                    {/* key بيخلي القائمة تتصفّر لما البلدية تتغير */}
                    <select key={municipalityId} ref={subMunicipalityRef} className={inputCls} disabled={!subs.length}>
                      <option value="">{!municipalityId ? "اختر البلدية أولًا" : subs.length ? "اختر الحي" : "لا توجد أحياء"}</option>
                      {subs.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

              {/* معلومات التنفيذ */}
              <section className={cardCls}>
                <header className={cardHeaderCls}>
                  <h2 className="font-semibold text-slate-900">معلومات التنفيذ</h2>
                  <p className="mt-0.5 text-sm text-slate-500">التواريخ والملحوظات الإضافية.</p>
                </header>
                <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
                  <label className="block">
                    <span className={labelCls}>تاريخ البداية</span>
                    <input ref={startDateRef} type="date" className={inputCls} />
                  </label>

                  <label className="block">
                    <span className={labelCls}>تاريخ النهاية</span>
                    <input ref={endDateRef} type="date" className={inputCls} />
                    {errors.endDate && <span className={errorCls}>{errors.endDate}</span>}
                  </label>

                  <label className="block sm:col-span-2">
                    <span className={labelCls}>ملاحظات</span>
                    <textarea
                      ref={notesRef}
                      rows={4}
                      className={inputCls}
                      placeholder="اكتب أي ملاحظات إضافية عن المشروع"
                    />
                  </label>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              {/* المقاولين */}
              <section className={cardCls}>
                <header className={cardHeaderCls}>
                  <h2 className="font-semibold text-slate-900">المقاولين</h2>
                  <p className="mt-0.5 text-sm text-slate-500">اختر المقاولين المسند إليهم المشروع.</p>
                </header>
                <div className="space-y-3 p-6">
                  {contractors.length === 0 ? (
                    <p className="text-sm text-slate-500">لا توجد بيانات للمقاولين.</p>
                  ) : (
                    contractors.map((contractor) => {
                      const isSelected = contractorIds.includes(contractor.id);
                      return (
                        <button
                          key={contractor.id}
                          type="button"
                          onClick={() => toggleContractor(contractor.id)}
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-right text-sm transition ${
                            isSelected
                              ? "border-sky-200 bg-sky-50 text-sky-700"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{contractor.name}</span>
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                              isSelected ? "border-sky-600 bg-sky-600 text-white" : "border-slate-300 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                        </button>
                      );
                    })
                  )}
                  {errors.contractorIds && <p className="text-xs text-red-600">{errors.contractorIds}</p>}
                </div>
              </section>

              {/* الحفظ */}
              <section className={cardCls}>
                <header className={cardHeaderCls}>
                  <h2 className="font-semibold text-slate-900">حفظ المشروع</h2>
                </header>
                <div className="space-y-4 p-6">
                  {saveError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</div>}

                  <button
                    type="submit"
                    disabled={saving}
                    className="h-11 w-full rounded-lg bg-sky-600 px-4 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {saving ? "جارٍ الحفظ..." : "حفظ المشروع"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/projects")}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    إلغاء
                  </button>
                </div>
              </section>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}