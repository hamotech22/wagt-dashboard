import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import logoWhite from "../../assets/images/logo-white.png";

export default function Home() {
  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-20 text-white"
      style={{
        backgroundColor: "#020617",
        backgroundImage:
          "radial-gradient(circle at center, rgba(15,23,42,.25), rgba(2,6,23,.9)), radial-gradient(circle at 85% 15%, rgba(16,185,129,.15), transparent 24rem), radial-gradient(circle at 15% 90%, rgba(6,182,212,.1), transparent 30rem)",
      }}
    >
      <section className="mx-auto max-w-4xl text-center">
        <img src={logoWhite} alt="شعار وقت" className="mx-auto mb-8 h-auto w-56 object-contain" />
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          إدارة أذكى للنفايات، <span className="mt-2 block text-emerald-300">ومدن أكثر استدامة</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
          منصة وقت تجمع بيانات البوابات والمركبات والعمليات في مكان واحد، لتمنحك رؤية أوضح وتحكماً أفضل في إدارة النفايات.
        </p>
        <Link
          to="/dashboard"
          className="group mt-9 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-emerald-400 px-7 py-3 font-bold text-slate-950 shadow-lg shadow-emerald-950/30 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          انتقل إلى لوحة التحكم
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" />
        </Link>
        <p className="mt-5 text-sm text-slate-400">كل بياناتك التشغيلية في لوحة واحدة</p>
      </section>
    </main>
  );
}
