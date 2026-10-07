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

export default function AddOrganization() {
  const navigate = useNavigate();

  const nameRef = useRef();
  const codeRef = useRef();
  const slugRef = useRef();
  const municipalityCodeRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();
  const websiteRef = useRef();
  const cityRef = useRef();
  const regionRef = useRef();
  const addressRef = useRef();
  const statusRef = useRef();

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const data = {
      name: nameRef.current.value.trim(),
      code: codeRef.current.value,
      slug: slugRef.current.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
      municipalityCode: municipalityCodeRef.current.value,
      email: emailRef.current.value,
      phone: phoneRef.current.value,
      website: websiteRef.current.value,
      city: cityRef.current.value,
      region: regionRef.current.value,
      address: addressRef.current.value,
      status: statusRef.current.value,
    };

    const newErrors = {};
    if (!data.name) newErrors.name = "أدخل اسم الجهة";
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) newErrors.email = "أدخل بريدًا إلكترونيًا صحيحًا";
    if (data.website && !/^https?:\/\//i.test(data.website)) newErrors.website = "يجب أن يبدأ الرابط بـ http:// أو https://";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    setSaveError("");
    try {
      await axios.post(`${API_URL}/organizations`, data);
      navigate("/dashboard/organizations");
    } catch (err) {
      setSaveError(err.message || "تعذّر حفظ الجهة");
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/organizations">الجهات والبلديات</Breadcrumb.Link>
        <Breadcrumb.Current>إضافة جهة</Breadcrumb.Current>
      </Breadcrumb>

      {/* العنوان */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">إضافة جهة</h1>
        <p className="text-sm text-gray-500">أدخل بيانات الجهة أو البلدية. الحقول المعلَّمة بـ * مطلوبة.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* العمود الأيمن: بيانات الجهة */}
          <div className="space-y-5 lg:col-span-2">
            {/* المعلومات الأساسية */}
            <section className={cardCls}>
              <header className={cardHeaderCls}>
                <h2 className={cardTitleCls}>المعلومات الأساسية</h2>
              </header>
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className={labelCls}>
                    اسم الجهة <span className="text-red-500">*</span>
                  </span>
                  <input ref={nameRef} className={inputCls} placeholder="مثال: أمانة منطقة نجران" autoFocus />
                  {errors.name && <span className={errorCls}>{errors.name}</span>}
                </label>

                <label className="block">
                  <span className={labelCls}>رمز الجهة</span>
                  <input ref={codeRef} className={inputCls} dir="ltr" placeholder="ORG-001" />
                  <span className={hintCls}>اتركه فارغًا ليُولَّد تلقائيًا</span>
                </label>

                <label className="block sm:col-span-2">
                  <span className={labelCls}>النطاق الفرعي</span>
                  <input ref={slugRef} className={inputCls} dir="ltr" placeholder="najran" />
                  <span className={hintCls}>يظهر في الرابط بعد الدخول، مثال: /najran/dashboard</span>
                </label>

                <label className="block">
                  <span className={labelCls}>كود البلدية في مدينتي</span>
                  <input ref={municipalityCodeRef} className={inputCls} dir="ltr" placeholder="9" />
                  <span className={hintCls}>المرجع الخارجي (MunicipalityCode)، إن وُجد</span>
                </label>
              </div>
            </section>

            {/* معلومات التواصل */}
            <section className={cardCls}>
              <header className={cardHeaderCls}>
                <h2 className={cardTitleCls}>معلومات التواصل</h2>
                <p className={cardSubtitleCls}>بيانات التواصل الرسمية مع الجهة.</p>
              </header>
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className={labelCls}>البريد الإلكتروني</span>
                  <input ref={emailRef} type="email" className={inputCls} dir="ltr" placeholder="example@email.com" />
                  {errors.email && <span className={errorCls}>{errors.email}</span>}
                </label>

                <label className="block">
                  <span className={labelCls}>رقم الهاتف</span>
                  <input ref={phoneRef} className={inputCls} dir="ltr" placeholder="+966 5XXXXXXXX" />
                </label>

                <label className="block">
                  <span className={labelCls}>الموقع الإلكتروني</span>
                  <input ref={websiteRef} className={inputCls} dir="ltr" placeholder="https://website.com" />
                  {errors.website && <span className={errorCls}>{errors.website}</span>}
                </label>
              </div>
            </section>

            {/* الموقع */}
            <section className={cardCls}>
              <header className={cardHeaderCls}>
                <h2 className={cardTitleCls}>الموقع</h2>
                <p className={cardSubtitleCls}>موقع الجهة وعنوانها.</p>
              </header>
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                <label className="block">
                  <span className={labelCls}>المدينة</span>
                  <input ref={cityRef} className={inputCls} placeholder="المدينة" />
                </label>

                <label className="block">
                  <span className={labelCls}>المنطقة</span>
                  <input ref={regionRef} className={inputCls} placeholder="المنطقة" />
                </label>

                <label className="block sm:col-span-2">
                  <span className={labelCls}>العنوان التفصيلي</span>
                  <textarea ref={addressRef} rows={3} className={inputCls} placeholder="اسم الحي، الشارع، رقم المبنى" />
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
                  <span className={labelCls}>حالة الجهة</span>
                  <select ref={statusRef} defaultValue="active" className={inputCls}>
                    <option value="active">نشطة</option>
                    <option value="inactive">غير نشطة</option>
                  </select>
                </label>
              </div>
            </section>

            {/* الحفظ */}
            <section className={cardCls}>
              <header className={cardHeaderCls}>
                <h2 className={cardTitleCls}>حفظ الجهة</h2>
              </header>
              <div className="space-y-3 p-5">
                {saveError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</div>}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {saving ? "جارٍ الحفظ..." : "حفظ الجهة"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard/organizations")}
                  className="w-full border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
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