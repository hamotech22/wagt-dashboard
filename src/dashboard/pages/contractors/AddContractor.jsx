import axios from "axios";
import { useRef, useState } from "react";
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

export default function AddContractor() {
  const navigate = useNavigate();

  // ref لكل حقل في الفورم
  const legalNameRef = useRef();
  const commercialNameRef = useRef();
  const baladiAccountIdRef = useRef();
  const contactNameRef = useRef();
  const phoneRef = useRef();
  const emailRef = useRef();
  const statusRef = useRef();

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // حفظ المقاول
  const handleSubmit = (event) => {
    event.preventDefault();
    if (saving) return;

    const data = {
      legalName: legalNameRef.current.value.trim(),
      commercialName: commercialNameRef.current.value.trim(),
      baladiAccountId: baladiAccountIdRef.current.value,
      contactName: contactNameRef.current.value,
      phone: phoneRef.current.value,
      email: emailRef.current.value,
      status: statusRef.current.value,
    };

    // التحقق
    const newErrors = {};
    if (!data.legalName) newErrors.legalName = "الاسم القانوني مطلوب";
    if (!data.commercialName) newErrors.commercialName = "الاسم التجاري مطلوب";
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) newErrors.email = "البريد غير صحيح";
    if (data.phone && !/^[0-9+\s-]{7,15}$/.test(data.phone)) newErrors.phone = "رقم الجوال غير صحيح";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // الحفظ
    setSaving(true);
    setSaveError("");

    axios
      .post(`${API_URL}/contractors`, data)
      .then(() => navigate("/dashboard/contractors"))
      .catch((err) => {
        setSaveError(err.message || "تعذّر حفظ المقاول");
        setSaving(false);
      });
  };

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/contractors">المقاولون</Breadcrumb.Link>
        <Breadcrumb.Current>إضافة مقاول</Breadcrumb.Current>
      </Breadcrumb>

      {/* العنوان */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">إضافة مقاول</h1>
        <p className="text-sm text-gray-500">أدخل بيانات المقاول. الحقول المعلَّمة بـ * مطلوبة.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* العمود الأيمن: بيانات المقاول */}
          <div className="space-y-5 lg:col-span-2">
            {/* البيانات الأساسية */}
            <section className={cardCls}>
              <header className={cardHeaderCls}>
                <h2 className={cardTitleCls}>البيانات الأساسية</h2>
              </header>
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                <label className="block">
                  <span className={labelCls}>
                    الاسم القانوني <span className="text-red-500">*</span>
                  </span>
                  <input ref={legalNameRef} className={inputCls} autoFocus />
                  {errors.legalName && <span className={errorCls}>{errors.legalName}</span>}
                </label>

                <label className="block">
                  <span className={labelCls}>
                    الاسم التجاري <span className="text-red-500">*</span>
                  </span>
                  <input ref={commercialNameRef} className={inputCls} />
                  {errors.commercialName && <span className={errorCls}>{errors.commercialName}</span>}
                </label>

                <label className="block sm:col-span-2">
                  <span className={labelCls}>رقم حساب بلدي</span>
                  <input ref={baladiAccountIdRef} className={inputCls} dir="ltr" />
                  <span className={hintCls}>اختياري</span>
                </label>
              </div>
            </section>

            {/* معلومات التواصل */}
            <section className={cardCls}>
              <header className={cardHeaderCls}>
                <h2 className={cardTitleCls}>معلومات التواصل</h2>
                <p className={cardSubtitleCls}>بيانات التواصل مع المقاول.</p>
              </header>
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className={labelCls}>مسؤول التواصل</span>
                  <input ref={contactNameRef} className={inputCls} />
                </label>

                <label className="block">
                  <span className={labelCls}>الجوال</span>
                  <input ref={phoneRef} className={inputCls} dir="ltr" />
                  {errors.phone && <span className={errorCls}>{errors.phone}</span>}
                </label>

                <label className="block">
                  <span className={labelCls}>البريد الإلكتروني</span>
                  <input ref={emailRef} className={inputCls} dir="ltr" />
                  {errors.email && <span className={errorCls}>{errors.email}</span>}
                </label>
              </div>
            </section>
          </div>

          {/* العمود الأيسر: الحالة والحفظ */}
          <div className="space-y-5">
            {/* الحالة */}
            <section className={cardCls}>
              <header className={cardHeaderCls}>
                <h2 className={cardTitleCls}>الحالة</h2>
              </header>
              <div className="p-5">
                <label className="block">
                  <span className={labelCls}>حالة المقاول</span>
                  <select ref={statusRef} defaultValue="active" className={inputCls}>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="suspended">موقوف</option>
                  </select>
                </label>
              </div>
            </section>

            {/* الحفظ */}
            <section className={cardCls}>
              <header className={cardHeaderCls}>
                <h2 className={cardTitleCls}>حفظ المقاول</h2>
              </header>
              <div className="space-y-3 p-5">
                {saveError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</div>}

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-500 dark:hover:bg-sky-400 dark:focus-visible:ring-offset-slate-900"
                >
                  {saving ? "جارٍ الحفظ..." : "حفظ المقاول"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard/contractors")}
                  className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  إلغاء
                </button>
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}