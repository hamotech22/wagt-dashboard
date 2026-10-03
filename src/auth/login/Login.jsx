import { useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo-blue.png";

export default function Login() {
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const username = usernameRef.current.value;
    const password = passwordRef.current.value;

    console.log({ username, password });
  };

  return (
    <div dir="rtl" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 px-4">
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

      {/* Login Card */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70"
      >
        {/* Logo */}
        <img src={logo} alt="WAQT" className="h-10 mx-auto mb-6 object-contain" />

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">تسجيل الدخول</h2>

          <p className="mt-1.5 text-sm text-slate-500">أدخل بياناتك لتسجيل الدخول إلى حسابك</p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">اسم المستخدم</label>

            <input
              ref={usernameRef}
              type="text"
              required
              placeholder="ادخل اسم المستخدم"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
            />
          </div>

          {/* Password */}
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

          {/* Button */}
          <button
            type="submit"
            className="mt-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            دخول
          </button>

          {/* Register */}
          <p className="text-center text-sm text-slate-500 mt-1">
            ليس لديك حساب؟{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
