import axios from "axios";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
const primaryBtnCls = "w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed";
const cancelBtnCls = "w-full border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm text-center";

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

  // حفظ المقاول
  const handleSubmit = (event) => {
    event.preventDefault();

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
    axios.post(`${API_URL}/contractors`, data).then(() => navigate("/dashboard/contractors"));
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
                <button type="submit" disabled={saving} className={primaryBtnCls}>
                  {saving ? "جارٍ الحفظ..." : "حفظ المقاول"}
                </button>

                <Link to="/dashboard/contractors" className={`${cancelBtnCls} block`}>
                  إلغاء
                </Link>
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}