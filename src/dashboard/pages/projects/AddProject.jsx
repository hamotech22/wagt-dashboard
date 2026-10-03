import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000";

const EMPTY = {
  name: "",
  code: "",
  contractNumber: "",
  status: "active",
  municipalityId: "",
  subMunicipalityId: "",
  contractorIds: [],
  startDate: "",
  endDate: "",
  notes: "",
};

const inputCls =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

const STATUS_OPTIONS = [
  { value: "active", label: "نشط" },
  { value: "pending", label: "قيد التنفيذ" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغي" },
];

const projectsApi = {
  lookups: () =>
    axios
      .all([axios.get(`${API_URL}/municipalities`), axios.get(`${API_URL}/contractors`)])
      .then(([municipalitiesResponse, contractorsResponse]) => ({
        municipalities: municipalitiesResponse?.data ?? [],
        contractors: contractorsResponse?.data ?? [],
      }))
      .catch(() => ({ municipalities: [], contractors: [] })),
  create: (payload) =>
    axios.post(`${API_URL}/projects`, { ...payload, createdAt: new Date().toISOString() }).then((response) => response.data),
};

function Card({ title, description, children }) {
  return (
    <section className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70">
      <header className="border-b border-slate-100 px-6 py-4">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({ label, required, error, hint, children, className = "" }) {
  return (
    <label className={`block text-sm text-slate-700 ${className}`}>
      <span className="mb-1.5 flex items-center gap-1 font-medium">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export default function AddProject({ onCancel, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [municipalities, setMunicipalities] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(EMPTY), [form]);
  const subs = municipalities.find((m) => String(m.id) === String(form.municipalityId))?.subs ?? [];

  const set = (patch) => {
    setForm((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      Object.keys(patch).forEach((key) => delete next[key]);
      return next;
    });
  };

  const loadLookups = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await projectsApi.lookups();
      setMunicipalities(data.municipalities || []);
      setContractors(data.contractors || []);
    } catch (err) {
      setLoadError(err.message || "تعذّر تحميل بيانات النموذج");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleContractor = (id) => {
    set({
      contractorIds: form.contractorIds.includes(id)
        ? form.contractorIds.filter((contractorId) => contractorId !== id)
        : [...form.contractorIds, id],
    });
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "أدخل اسم المشروع";
    if (!form.municipalityId) nextErrors.municipalityId = "اختر البلدية";
    if (form.contractorIds.length === 0) nextErrors.contractorIds = "اختر مقاولًا واحدًا على الأقل";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      nextErrors.endDate = "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
    }
    setErrors(nextErrors);
    return nextErrors;
  };

  const save = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const created = await projectsApi.create({ ...form, name: form.name.trim() });
      onSaved?.(created);
    } catch (err) {
      setSaveError(err.message || "تعذّر حفظ المشروع");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (saving) return;
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setTimeout(() => {
        const firstInvalid = document.querySelector('[aria-invalid="true"]');
        firstInvalid?.scrollIntoView({ block: "center", behavior: "smooth" });
        firstInvalid?.focus();
      }, 0);
      return;
    }
    save();
  };

  const handleCancel = () => {
    if (dirty) {
      const shouldLeave = window.confirm("هل تريد الخروج بدون حفظ التغييرات؟");
      if (!shouldLeave) return;
    }
    onCancel?.();
  };

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    if (!dirty) return;

    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (
    <div className="p-6">
      <nav aria-label="مسار التنقل" className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <button type="button" onClick={handleCancel} className="hover:text-sky-600">
          المشاريع
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-slate-800">إضافة مشروع</span>
      </nav>

      <h1 className="text-xl font-bold text-slate-900">إضافة مشروع</h1>
      <p className="mt-1 text-sm text-slate-500">أدخل بيانات المشروع واربطه بالبلدية والمقاولين. الحقول المعلَّمة بـ * مطلوبة.</p>

      {loading && (
        <div className="mt-6 animate-pulse space-y-4" aria-busy="true" aria-label="جارٍ التحميل">
          <div className="h-56 rounded-xl bg-slate-100" />
          <div className="h-40 rounded-xl bg-slate-100" />
        </div>
      )}

      {loadError && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200/70">
          <p className="font-medium text-slate-800">تعذّر تحميل بيانات النموذج</p>
          <p className="text-sm text-slate-500">{loadError}</p>
          <button
            type="button"
            onClick={loadLookups}
            className="h-10 rounded-lg border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-50"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {!loading && !loadError && (
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card title="بيانات المشروع">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="اسم المشروع" required error={errors.name} className="sm:col-span-2">
                    <input
                      className={inputCls}
                      value={form.name}
                      onChange={(event) => set({ name: event.target.value })}
                      aria-invalid={Boolean(errors.name)}
                      placeholder="مثال: مشروع نجران"
                      autoFocus
                    />
                  </Field>

                  <Field label="رقم المشروع" hint="اتركه فارغًا ليُولَّد تلقائيًا">
                    <input
                      className={inputCls}
                      dir="ltr"
                      value={form.code}
                      onChange={(event) => set({ code: event.target.value })}
                      placeholder="PRJ-001"
                    />
                  </Field>

                  <Field label="رقم العقد">
                    <input
                      className={inputCls}
                      dir="ltr"
                      value={form.contractNumber}
                      onChange={(event) => set({ contractNumber: event.target.value })}
                      placeholder="CN-2026-001"
                    />
                  </Field>

                  <Field label="الحالة" className="sm:col-span-2">
                    <select className={inputCls} value={form.status} onChange={(event) => set({ status: event.target.value })}>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </Card>

              <Card title="النطاق الإداري" description="البلدية التي يتبع لها المشروع.">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="البلدية" required error={errors.municipalityId}>
                    <select
                      className={inputCls}
                      value={form.municipalityId}
                      onChange={(event) => set({ municipalityId: event.target.value, subMunicipalityId: "" })}
                      aria-invalid={Boolean(errors.municipalityId)}
                    >
                      <option value="">اختر البلدية</option>
                      {municipalities.map((municipality) => (
                        <option key={municipality.id} value={municipality.id}>
                          {municipality.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="الفرع / الحي">
                    <select
                      className={inputCls}
                      value={form.subMunicipalityId}
                      disabled={!subs.length}
                      onChange={(event) => set({ subMunicipalityId: event.target.value })}
                    >
                      <option value="">{!form.municipalityId ? "اختر البلدية أولًا" : subs.length ? "اختر الحي" : "لا توجد أحياء"}</option>
                      {subs.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </Card>

              <Card title="معلومات التنفيذ" description="التواريخ والملحوظات الإضافية.">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="تاريخ البداية">
                    <input
                      type="date"
                      className={inputCls}
                      value={form.startDate}
                      onChange={(event) => set({ startDate: event.target.value })}
                    />
                  </Field>

                  <Field label="تاريخ النهاية" error={errors.endDate}>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.endDate}
                      onChange={(event) => set({ endDate: event.target.value })}
                      aria-invalid={Boolean(errors.endDate)}
                    />
                  </Field>

                  <Field label="ملاحظات" className="sm:col-span-2">
                    <textarea
                      rows={4}
                      className={inputCls}
                      value={form.notes}
                      onChange={(event) => set({ notes: event.target.value })}
                      placeholder="اكتب أي ملاحظات إضافية عن المشروع"
                    />
                  </Field>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="المقاولين" description="اختر المقاولين المسند إليهم المشروع.">
                <div className="space-y-3">
                  {contractors.length === 0 ? (
                    <p className="text-sm text-slate-500">لا توجد بيانات للمقاولين.</p>
                  ) : (
                    contractors.map((contractor) => {
                      const isSelected = form.contractorIds.includes(contractor.id);
                      return (
                        <button
                          key={contractor.id}
                          type="button"
                          onClick={() => toggleContractor(contractor.id)}
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-right text-sm transition ${
                            isSelected
                              ? "border-sky-200 bg-sky-50 text-sky-700"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                          aria-invalid={Boolean(errors.contractorIds)}
                        >
                          <span>{contractor.name}</span>
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                              isSelected ? "border-sky-600 bg-sky-600 text-white" : "border-slate-300 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                        </button>
                      );
                    })
                  )}
                  {errors.contractorIds && <p className="text-xs text-red-600">{errors.contractorIds}</p>}
                </div>
              </Card>

              <Card title="حفظ المشروع">
                <div className="space-y-4">
                  {saveError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</div>}

                  <button
                    type="submit"
                    disabled={saving}
                    className="h-11 w-full rounded-lg bg-sky-600 px-4 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {saving ? "جارٍ الحفظ..." : "حفظ المشروع"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    إلغاء
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
