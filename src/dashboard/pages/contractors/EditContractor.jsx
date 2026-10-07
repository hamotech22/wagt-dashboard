import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

// ---------- أشكال العناصر (نفس أشكال باقي الصفحات) ----------
const inputCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const cardCls = "bg-white rounded-xl shadow-sm";
const cardHeaderCls = "border-b px-5 py-3";
const cardTitleCls = "font-semibold text-gray-800";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";
const errorCls = "block text-xs text-red-600 mt-1";

export default function EditContractor() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ref لكل حقل في الفورم
  const legalNameRef = useRef();
  const commercialNameRef = useRef();
  const contactNameRef = useRef();
  const phoneRef = useRef();
  const emailRef = useRef();
  const baladiAccountIdRef = useRef();
  const statusRef = useRef();

  const [contractor, setContractor] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // جلب بيانات المقاول
  useEffect(() => {
    axios.get(`${API_URL}/contractors/${id}`).then((res) => setContractor(res.data));
  }, [id]);

  // حفظ التعديلات
  const handleSubmit = () => {
    const data = {
      ...contractor,
      legalName: legalNameRef.current.value.trim(),
      commercialName: commercialNameRef.current.value.trim(),
      contactName: contactNameRef.current.value,
      phone: phoneRef.current.value,
      email: emailRef.current.value,
      baladiAccountId: baladiAccountIdRef.current.value,
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
    axios.put(`${API_URL}/contractors/${id}`, data).then(() => navigate("/dashboard/contractors"));
  };

  if (!contractor) {
    return (
      <div dir="rtl" className="p-6 text-gray-400">
        جارِ التحميل...
      </div>
    );
  }

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/contractors">المقاولون</Breadcrumb.Link>
        <Breadcrumb.Current>تعديل المقاول</Breadcrumb.Current>
      </Breadcrumb>

      {/* العنوان */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">تعديل المقاول</h1>
        <p className="text-sm text-gray-500" dir="ltr">
          {contractor.id}
        </p>
      </div>

      <div className={cardCls}>
        <header className={cardHeaderCls}>
          <h2 className={cardTitleCls}>بيانات المقاول</h2>
        </header>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className={labelCls}>
              الاسم القانوني <span className="text-red-500">*</span>
            </span>
            <input ref={legalNameRef} defaultValue={contractor.legalName} className={inputCls} />
            {errors.legalName && <span className={errorCls}>{errors.legalName}</span>}
          </label>

          <label className="block">
            <span className={labelCls}>
              الاسم التجاري <span className="text-red-500">*</span>
            </span>
            <input ref={commercialNameRef} defaultValue={contractor.commercialName} className={inputCls} />
            {errors.commercialName && <span className={errorCls}>{errors.commercialName}</span>}
          </label>

          <label className="block">
            <span className={labelCls}>مسؤول التواصل</span>
            <input ref={contactNameRef} defaultValue={contractor.contactName} className={inputCls} />
          </label>

          <label className="block">
            <span className={labelCls}>الجوال</span>
            <input ref={phoneRef} defaultValue={contractor.phone} className={inputCls} dir="ltr" />
            {errors.phone && <span className={errorCls}>{errors.phone}</span>}
          </label>

          <label className="block">
            <span className={labelCls}>البريد الإلكتروني</span>
            <input ref={emailRef} defaultValue={contractor.email} className={inputCls} dir="ltr" />
            {errors.email && <span className={errorCls}>{errors.email}</span>}
          </label>

          <label className="block">
            <span className={labelCls}>رقم حساب بلدي (اختياري)</span>
            <input ref={baladiAccountIdRef} defaultValue={contractor.baladiAccountId} className={inputCls} dir="ltr" />
          </label>

          <label className="block">
            <span className={labelCls}>الحالة</span>
            <select ref={statusRef} defaultValue={contractor.status} className={inputCls}>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="suspended">موقوف</option>
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t px-5 py-4">
          <Link to="/dashboard/contractors" className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm">
            إلغاء
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </div>
    </div>
  );
}