import { useState } from "react";
import Breadcrumb from "../../components/common/Breadcrumb";

// بيانات تجريبية: في الحقيقي تيجي من الـ API أو من prop
const SAMPLE = {
  id: "CTR-0001",
  legalName: "شركة الأفق للمقاولات والخدمات البيئية",
  commercialName: "الأفق البيئية",
  contactName: "خالد العسيري",
  phone: "0501234567",
  email: "info@ofoq.example",
  baladiAccountId: "778120",
  status: "active",
};

const input =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700";

export default function EditContractor({ contractor = SAMPLE, onSave, onCancel }) {
  const [form, setForm] = useState(contractor);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = () => {
    const err = {};
    if (!form.legalName.trim()) err.legalName = "الاسم القانوني مطلوب";
    if (!form.commercialName.trim()) err.commercialName = "الاسم التجاري مطلوب";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = "البريد غير صحيح";
    if (form.phone && !/^[0-9+\s-]{7,15}$/.test(form.phone)) err.phone = "رقم الجوال غير صحيح";

    setErrors(err);
    if (Object.keys(err).length > 0) return;

    // هنا تبعت التعديل للـ API لو حبيت:
    // await fetch(`/api/contractors/${form.id}`, { method: "PUT", body: JSON.stringify(form) })
    onSave?.(form);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto w-full max-w-7xl">
        <Breadcrumb>
          <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
          <Breadcrumb.Link to="/dashboard/contractors">المقاولون</Breadcrumb.Link>
          <Breadcrumb.Current>تعديل المقاول</Breadcrumb.Current>
        </Breadcrumb>
        <h1 className="mb-1 text-2xl font-bold">تعديل المقاول</h1>
        <p dir="ltr" className="mb-6 text-start text-sm text-slate-500">{form.id}</p>

        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm font-medium">
              الاسم القانوني *
              <input className={`${input} mt-1`} value={form.legalName} onChange={set("legalName")} />
              {errors.legalName && <span className="text-xs text-red-600">{errors.legalName}</span>}
            </label>

            <label className="block text-sm font-medium">
              الاسم التجاري *
              <input className={`${input} mt-1`} value={form.commercialName} onChange={set("commercialName")} />
              {errors.commercialName && <span className="text-xs text-red-600">{errors.commercialName}</span>}
            </label>

            <label className="block text-sm font-medium">
              مسؤول التواصل
              <input className={`${input} mt-1`} value={form.contactName} onChange={set("contactName")} />
            </label>

            <label className="block text-sm font-medium">
              الجوال
              <input dir="ltr" className={`${input} mt-1`} value={form.phone} onChange={set("phone")} />
              {errors.phone && <span className="text-xs text-red-600">{errors.phone}</span>}
            </label>

            <label className="block text-sm font-medium">
              البريد الإلكتروني
              <input dir="ltr" className={`${input} mt-1`} value={form.email} onChange={set("email")} />
              {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
            </label>

            <label className="block text-sm font-medium">
              رقم حساب بلدي (اختياري)
              <input dir="ltr" className={`${input} mt-1`} value={form.baladiAccountId} onChange={set("baladiAccountId")} />
            </label>

            <label className="block text-sm font-medium">
              الحالة
              <select className={`${input} mt-1`} value={form.status} onChange={set("status")}>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="suspended">موقوف</option>
              </select>
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              onClick={onCancel}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              إلغاء
            </button>
            <button
              onClick={submit}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:bg-sky-500 dark:hover:bg-sky-400 dark:focus-visible:ring-offset-slate-900"
            >
              حفظ التعديلات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}