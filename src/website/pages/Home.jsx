import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo1.jpeg";

export default function Home() {
  return (
    <main dir="rtl" className="flex min-h-screen items-center justify-cente px-6 py-16 text-slate-900">
      <section className="mx-auto max-w-4xl text-center">
        {/* mix-blend-multiply بيخفي الخلفية البيضا للصورة JPEG */}
        <img src={logo} alt="شعار وقت" className="mx-auto mb-4 h-auto w-72 object-contain mix-blend-multiply sm:w-80" />
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
          إدارة أذكى للنفايات، <span className="mt-2 block text-blue-600">ومدن أكثر استدامة</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          منصة وقت تجمع بيانات البوابات والمركبات والعمليات في مكان واحد، لتمنحك رؤية أوضح وتحكماً أفضل في إدارة النفايات.
        </p>
        <Link to="/dashboard" className="group mt-9 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-blue-700 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white">
          انتقل إلى لوحة التحكم
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" />
        </Link>
        <p className="mt-5 text-xs text-slate-500">كل بياناتك التشغيلية في لوحة واحدة</p>
      </section>
    </main>
  );
}
