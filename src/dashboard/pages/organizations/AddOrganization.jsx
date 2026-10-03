import axios from "axios";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

const inputCls =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";
const cardCls = "rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70";
const cardHeaderCls = "border-b border-slate-100 px-6 py-4";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";
const hintCls = "mt-1 block text-xs text-slate-500";
const errorCls = "mt-1 block text-xs text-red-600";

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
    <div className="p-6">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/organizations">الجهات والبلديات</Breadcrumb.Link>
        <Breadcrumb.Current>إضافة جهة</Breadcrumb.Current>
      </Breadcrumb>
      <h1 className="text-xl font-bold text-slate-900">إضافة جهة</h1>
      <p className="mt-1 text-sm text-slate-500">أدخل بيانات الجهة أو البلدية. الحقول المعلَّمة بـ * مطلوبة.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* المعلومات الأساسية */}
            <section className={cardCls}>
              <header className={cardHeaderCls}>
                <h2 className="font-semibold text-slate-900">المعلومات الأساسية</h2>
              </header>
              <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
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
                <h2 className="font-semibold text-slate-900">معلومات التواصل</h2>
                <p className="mt-0.5 text-sm text-slate-500">بيانات التواصل الرسمية مع الجهة.</p>
              </header>
              <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
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
                <h2 className="font-semibold text-slate-900">الموقع</h2>
                <p className="mt-0.5 text-sm text-slate-500">موقع الجهة وعنوانها.</p>
              </header>
              <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
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
                  <textarea ref={addressRef} rows={3} className={`${inputCls} h-auto py-2`} placeholder="اسم الحي، الشارع، رقم المبنى" />
                </label>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {/* الحالة */}
            <section className={cardCls}>
              <header className={cardHeaderCls}>
                <h2 className="font-semibold text-slate-900">الحالة</h2>
              </header>
              <div className="p-6">
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
                <h2 className="font-semibold text-slate-900">حفظ الجهة</h2>
              </header>
              <div className="space-y-4 p-6">
                {saveError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</div>}

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 w-full rounded-lg bg-sky-600 px-4 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {saving ? "جارٍ الحفظ..." : "حفظ الجهة"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard/organizations")}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700 transition hover:bg-slate-50"
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
