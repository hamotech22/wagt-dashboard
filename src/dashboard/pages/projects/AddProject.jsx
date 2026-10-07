import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

// ---------- أشكال العناصر (نفس أشكال باقي الصفحات) ----------
const inputCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const cardCls = "bg-white rounded-xl shadow-sm";
const cardHeaderCls = "border-b px-5 py-3";
const cardTitleCls = "font-semibold text-gray-800";
const cardSubtitleCls = "mt-0.5 text-sm text-gray-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";
const hintCls = "block text-xs text-gray-400 mt-1";
const errorCls = "block text-xs text-red-600 mt-1";

// شكل زر المقاول (مختار / غير مختار)
const contractorBtnCls = "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-right text-sm";
const selectedCls = "border-blue-200 bg-blue-50 text-blue-700";
const unselectedCls = "border-gray-200 bg-white text-gray-700 hover:bg-gray-50";

export default function AddProject() {
  const navigate = useNavigate();

  // ref لكل حقل في الفورم
  const nameRef = useRef();
  const codeRef = useRef();
  const contractNumberRef = useRef();
  const statusRef = useRef();
  const municipalityRef = useRef();
  const subMunicipalityRef = useRef();
  const startDateRef = useRef();
  const endDateRef = useRef();
  const notesRef = useRef();

  // state فقط للحاجات اللي بتغيّر شكل الشاشة
  const [municipalityId, setMunicipalityId] = useState(""); // لعرض الأحياء
  const [contractorIds, setContractorIds] = useState([]); // المقاولين المختارين

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

  // حفظ المشروع
  const handleSubmit = (event) => {
    event.preventDefault();
    if (saving) return;

    const data = {
      name: nameRef.current.value.trim(),
      code: codeRef.current.value,
      contractNumber: contractNumberRef.current.value,
      status: statusRef.current.value,
      municipalityId: municipalityRef.current.value,
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

    axios
      .post(`${API_URL}/projects`, data)
      .then(() => navigate("/dashboard/projects"))
      .catch((err) => {
        setSaveError(err.message || "تعذّر حفظ المشروع");
        setSaving(false);
      });
  };

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/projects">المشاريع</Breadcrumb.Link>
        <Breadcrumb.Current>إضافة مشروع</Breadcrumb.Current>
      </Breadcrumb>

      {/* العنوان */}
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
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* العمود الأيمن: بيانات المشروع */}
            <div className="space-y-5 lg:col-span-2">
              {/* بيانات المشروع */}
              <section className={cardCls}>
                <header className={cardHeaderCls}>
                  <h2 className={cardTitleCls}>بيانات المشروع</h2>
                </header>
                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
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
                  <h2 className={cardTitleCls}>النطاق الإداري</h2>
                  <p className={cardSubtitleCls}>البلدية التي يتبع لها المشروع.</p>
                </header>
                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                  <label className="block">
                    <span className={labelCls}>
                      البلدية <span className="text-red-500">*</span>
                    </span>
                    {/* عند التغيير نحفظ القيمة في state لعرض الأحياء */}
                    <select
                      ref={municipalityRef}
                      className={inputCls}
                      defaultValue=""
                      onChange={() => setMunicipalityId(municipalityRef.current.value)}
                    >
                      <option value="">اختر البلدية</option>
                      {municipalities.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
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
                  <h2 className={cardTitleCls}>معلومات التنفيذ</h2>
                  <p className={cardSubtitleCls}>التواريخ والملحوظات الإضافية.</p>
                </header>
                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
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
                    <textarea ref={notesRef} rows={4} className={inputCls} placeholder="اكتب أي ملاحظات إضافية عن المشروع" />
                  </label>
                </div>
              </section>
            </div>

            {/* العمود الأيسر: المقاولين والحفظ */}
            <div className="space-y-5">
              {/* المقاولين */}
              <section className={cardCls}>
                <header className={cardHeaderCls}>
                  <h2 className={cardTitleCls}>المقاولين</h2>
                  <p className={cardSubtitleCls}>اختر المقاولين المسند إليهم المشروع.</p>
                </header>
                <div className="space-y-2 p-5">
                  {contractors.length === 0 && <p className="text-sm text-gray-500">لا توجد بيانات للمقاولين.</p>}

                  {contractors.map((contractor) => {
                    const isSelected = contractorIds.includes(contractor.id);

                    return (
                      <button
                        key={contractor.id}
                        type="button"
                        onClick={() => toggleContractor(contractor.id)}
                        className={`${contractorBtnCls} ${isSelected ? selectedCls : unselectedCls}`}
                      >
                        <span>{contractor.name}</span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                            isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                      </button>
                    );
                  })}

                  {errors.contractorIds && <p className="text-xs text-red-600">{errors.contractorIds}</p>}
                </div>
              </section>

              {/* الحفظ */}
              <section className={cardCls}>
                <header className={cardHeaderCls}>
                  <h2 className={cardTitleCls}>حفظ المشروع</h2>
                </header>
                <div className="space-y-3 p-5">
                  {saveError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</div>}

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {saving ? "جارٍ الحفظ..." : "حفظ المشروع"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/projects")}
                    className="w-full border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
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
