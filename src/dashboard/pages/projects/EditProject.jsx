import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:3000";

const statuses = {
  active: { label: "نشط", style: "bg-emerald-100 text-emerald-700" },
  pending: { label: "قيد التنفيذ", style: "bg-amber-100 text-amber-700" },
  completed: { label: "مكتمل", style: "bg-sky-100 text-sky-700" },
};

const projectsApi = {
  get: (id) => axios.get(`${API_URL}/projects/${id}`).then((response) => response.data),
  lookups: () =>
    axios
      .all([axios.get(`${API_URL}/municipalities`), axios.get(`${API_URL}/contractors`)])
      .then(([municipalitiesRes, contractorsRes]) => ({ municipalities: municipalitiesRes.data, contractors: contractorsRes.data })),
  update: (id, payload) => axios.put(`${API_URL}/projects/${id}`, payload).then((response) => response.data),
};

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  // state
  const [form, setForm] = useState(null);
  const [municipalities, setMunicipalities] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // API: تحميل المشروع والبلديات والمقاولين
  useEffect(() => {
    setLoading(true);
    setError("");

    Promise.all([projectsApi.get(id), projectsApi.lookups()])
      .then(([project, lookups]) => {
        // قيم الحقول تُخزَّن نصوصًا ليعمل بها الـ input والـ select
        setForm({
          ...project,
          municipalityId: String(project.municipalityId ?? ""),
          contractorId: String(project.contractorId ?? ""),
          startDate: project.startDate ?? "",
          budget: String(project.budget ?? ""),
        });
        setMunicipalities(lookups.municipalities);
        setContractors(lookups.contractors);
      })
      .catch((err) => setError(err.message || "تعذّر تحميل بيانات المشروع"))
      .finally(() => setLoading(false));
  }, [id, reloadKey]);

  // functions
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      await projectsApi.update(Number(id), {
        ...form,
        municipalityId: Number(form.municipalityId),
        contractorId: Number(form.contractorId),
        budget: Number(form.budget) || 0,
      });
      navigate(`/projects/${id}`);
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
        <p className="font-medium text-slate-800">تعذّر فتح المشروع</p>
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
            onClick={() => navigate("/projects")}
            className="h-10 rounded-lg bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-500"
          >
            العودة للمشاريع
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    "mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

  return (
    <div className="p-6">
      <nav aria-label="مسار التنقل" className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <button type="button" onClick={() => navigate("/projects")} className="hover:text-sky-600">
          المشاريع
        </button>
        <span aria-hidden="true">/</span>
        <button type="button" onClick={() => navigate(`/projects/${id}`)} className="hover:text-sky-600">
          {form.name}
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-slate-800">تعديل</span>
      </nav>

      <h1 className="text-xl font-bold text-slate-900">تعديل المشروع</h1>
      <p className="mt-1 text-sm text-slate-500">عدّل بيانات المشروع ثم احفظ التغييرات.</p>

      <form onSubmit={handleSubmit} className="mt-6 w-full space-y-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm text-slate-700 md:col-span-2">
            اسم المشروع *
            <input name="name" value={form.name} onChange={handleChange} className={inputClass} required autoFocus />
          </label>

          <label className="text-sm text-slate-700">
            الكود *
            <input name="code" value={form.code} onChange={handleChange} className={inputClass} required />
          </label>

          <label className="text-sm text-slate-700">
            رقم العقد *
            <input name="contractNumber" value={form.contractNumber} onChange={handleChange} className={inputClass} required />
          </label>

          <label className="text-sm text-slate-700">
            البلدية *
            <select name="municipalityId" value={form.municipalityId} onChange={handleChange} className={inputClass} required>
              <option value="">اختر البلدية</option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-700">
            المقاول *
            <select name="contractorId" value={form.contractorId} onChange={handleChange} className={inputClass} required>
              <option value="">اختر المقاول</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-700">
            الحالة
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              {Object.entries(statuses).map(([value, s]) => (
                <option key={value} value={value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-700">
            تاريخ البداية
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className={inputClass} />
          </label>

          <label className="text-sm text-slate-700">
            الميزانية
            <input type="number" min="0" name="budget" value={form.budget} onChange={handleChange} className={inputClass} />
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
            onClick={() => navigate(`/projects/${id}`)}
            disabled={saving}
            className="h-10 rounded-lg border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-10 rounded-lg bg-sky-600 px-6 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </form>
    </div>
  );
}
