import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

const statuses = {
  all: { label: "الكل", style: "bg-slate-100 text-slate-700" },
  active: { label: "نشطة", style: "bg-emerald-100 text-emerald-700" },
  inactive: { label: "غير نشطة", style: "bg-amber-100 text-amber-700" },
};

const organizationsApi = {
  get: (id) => axios.get(`${API_URL}/organizations/${id}`).then((response) => response.data),
  update: (id, payload) => axios.put(`${API_URL}/organizations/${id}`, payload).then((response) => response.data),
};

export default function EditOrganization() {
  const { id } = useParams();
  const navigate = useNavigate();

  // state
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // API: تحميل بيانات الجهة
  useEffect(() => {
    setLoading(true);
    setError("");

    organizationsApi
      .get(id)
      .then((org) => {
        // قيم الحقول تُخزَّن نصوصًا ليعمل بها الـ input والـ select
        setForm({
          ...org,
          municipalityCode: org.municipalityCode ?? "",
          email: org.email ?? "",
          phone: org.phone ?? "",
          website: org.website ?? "",
          city: org.city ?? "",
          region: org.region ?? "",
          address: org.address ?? "",
        });
      })
      .catch((err) => setError(err.message || "تعذّر تحميل بيانات الجهة"))
      .finally(() => setLoading(false));
  }, [id, reloadKey]);

  // functions
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      await organizationsApi.update(Number(id), { ...form, name: form.name.trim() });
      navigate(`/dashboard/organizations/${id}`);
    } catch (err) {
      setSaveError(err.message || "حدث خطأ أثناء حفظ التعديلات");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-6" aria-busy="true" aria-label="جارٍ التحميل">
        <div className="h-8 w-56 rounded-lg bg-slate-100" />
        <div className="h-96 max-w-3xl rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 p-16 text-center">
        <p className="font-medium text-slate-800">تعذّر فتح الجهة</p>
        <p className="text-sm text-slate-500">{error}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReloadKey(reloadKey + 1)}
            className="h-10 rounded-lg border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-50"
          >
            إعادة المحاولة
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/organizations")}
            className="h-10 rounded-lg bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-500"
          >
            العودة للجهات
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    "mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

  return (
    <div className="p-6">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/organizations">الجهات والبلديات</Breadcrumb.Link>
        <Breadcrumb.Current>تعديل الجهة</Breadcrumb.Current>
      </Breadcrumb>
      <h1 className="text-xl font-bold text-slate-900">تعديل الجهة</h1>
      <p className="mt-1 text-sm text-slate-500">عدّل بيانات الجهة ثم احفظ التغييرات.</p>

      <form onSubmit={handleSubmit} className="mt-6 w-full space-y-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm text-slate-700 md:col-span-2">
            اسم الجهة *
            <input name="name" value={form.name} onChange={handleChange} className={inputClass} required autoFocus />
          </label>

          <label className="text-sm text-slate-700">
            الرمز *
            <input name="code" dir="ltr" value={form.code} onChange={handleChange} className={inputClass} required />
          </label>

          <label className="text-sm text-slate-700">
            النطاق الفرعي *
            <input name="slug" dir="ltr" value={form.slug || ""} onChange={handleChange} className={inputClass} required />
          </label>

          <label className="text-sm text-slate-700">
            كود البلدية في مدينتي
            <input name="municipalityCode" dir="ltr" value={form.municipalityCode} onChange={handleChange} className={inputClass} />
          </label>

          <label className="text-sm text-slate-700">
            البريد الإلكتروني
            <input type="email" name="email" dir="ltr" value={form.email} onChange={handleChange} className={inputClass} />
          </label>

          <label className="text-sm text-slate-700">
            رقم الهاتف
            <input name="phone" dir="ltr" value={form.phone} onChange={handleChange} className={inputClass} />
          </label>

          <label className="text-sm text-slate-700 md:col-span-2">
            الموقع الإلكتروني
            <input type="url" name="website" dir="ltr" value={form.website} onChange={handleChange} className={inputClass} />
          </label>

          <label className="text-sm text-slate-700">
            المدينة
            <input name="city" value={form.city} onChange={handleChange} className={inputClass} />
          </label>

          <label className="text-sm text-slate-700">
            المنطقة
            <input name="region" value={form.region} onChange={handleChange} className={inputClass} />
          </label>

          <label className="text-sm text-slate-700 md:col-span-2">
            العنوان التفصيلي
            <textarea name="address" rows={3} value={form.address} onChange={handleChange} className={`${inputClass} h-auto py-2`} />
          </label>

          <label className="text-sm text-slate-700">
            الحالة
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              {Object.entries(statuses)
                .filter(([value]) => value !== "all")
                .map(([value, s]) => (
                  <option key={value} value={value}>
                    {s.label}
                  </option>
                ))}
            </select>
          </label>
        </div>

        {saveError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {saveError}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/organizations/${id}`)}
            disabled={saving}
            className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-10 rounded-lg bg-sky-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-500 dark:hover:bg-sky-400 dark:focus-visible:ring-offset-slate-900"
          >
            {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </form>
    </div>
  );
}
