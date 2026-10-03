import { useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo-blue.png";

export default function Register() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const entityTypeRef = useRef(null);
  const entityNameRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      name: nameRef.current.value,
      email: emailRef.current.value,
      phone: phoneRef.current.value,
      entityType: entityTypeRef.current.value,
      entityName: entityNameRef.current.value,
      password: passwordRef.current.value,
      confirmPassword: confirmRef.current.value,
    });
  };

  return (
    <div dir="rtl" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      {/* Background */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.14), transparent 70%)",
        }}
      />

      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(96,165,250,0.12), transparent 70%)",
        }}
      />

      {/* Register Card */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70"
      >
        {/* Logo */}
        <img src={logo} alt="WAQT" className="h-10 mx-auto mb-6 object-contain" />

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">إنشاء حساب جديد</h2>

          <p className="mt-1.5 text-sm text-slate-500">منصة إدارة البوابات الذكية — سجّل بياناتك وبيانات الجهة للانضمام إلى المنصة</p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">الاسم الكامل</label>

            <input
              ref={nameRef}
              type="text"
              required
              placeholder="مثال: أحمد محمد"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">البريد الإلكتروني</label>

              <input
                ref={emailRef}
                type="email"
                required
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">رقم الجوال</label>

              <input
                ref={phoneRef}
                type="tel"
                required
                placeholder="05xxxxxxxx"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="h-px bg-slate-100 my-1" />

          {/* Entity Type + Entity Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">نوع الجهة</label>

              <select
                ref={entityTypeRef}
                required
                defaultValue=""
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
              >
                <option value="" disabled>
                  اختر نوع الجهة
                </option>

                <option value="municipality">بلدية / أمانة</option>
                <option value="contractor">مقاول</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">اسم الجهة</label>

              <input
                ref={entityNameRef}
                type="text"
                required
                placeholder="اسم الجهة"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">كلمة المرور</label>

              <input
                ref={passwordRef}
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">تأكيد كلمة المرور</label>

              <input
                ref={confirmRef}
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="mt-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            إنشاء الحساب
          </button>

          {/* Login */}
          <p className="text-center text-sm text-slate-500 mt-1">
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
