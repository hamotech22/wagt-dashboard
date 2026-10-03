import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";

const CONTRACTORS = [
  {
    id: 1,
    commercialName: "الأفق البيئية",
    legalName: "شركة الأفق للمقاولات والخدمات البيئية",
    contactName: "خالد العسيري",
    phone: "0501234567",
    email: "info@ofoq.example",
    baladiAccountId: "778120",
    status: "active",
    createdAt: "2026-05-02",
  },
  {
    id: 2,
    commercialName: "نجران للنقل",
    legalName: "مؤسسة نجران للنقل والتخلص من النفايات",
    contactName: "سعيد اليامي",
    phone: "0559876543",
    email: "nagran@example.com",
    baladiAccountId: "778455",
    status: "active",
    createdAt: "2026-04-15",
  },
  {
    id: 3,
    commercialName: "الربوع",
    legalName: "شركة الربوع للمقاولات العامة",
    contactName: "محمد الشهري",
    phone: "0533344556",
    email: "",
    baladiAccountId: "",
    status: "suspended",
    createdAt: "2026-02-10",
  },
  {
    id: 4,
    commercialName: "البنيان الحديثة",
    legalName: "شركة البنيان الحديثة للمقاولات",
    contactName: "فهد القحطاني",
    phone: "0544455667",
    email: "",
    baladiAccountId: "779010",
    status: "active",
    createdAt: "2026-03-28",
  },
];

const PROJECTS = [
  { id: 1, name: "نظافة بلدية نجران المركزية" },
  { id: 2, name: "نظافة بلدية شرورة" },
  { id: 3, name: "تشغيل مردم نجران" },
  { id: 4, name: "نقل المخلفات الإنشائية" },
];

const LINKS = [
  { id: 1, projectId: 1, contractNumber: "C-2026-114", startDate: "2026-01-01", endDate: "2026-12-31" },
  { id: 2, projectId: 3, contractNumber: "C-2026-120", startDate: "2026-03-01", endDate: "2027-02-28" },
];

const STATUS = {
  active: ["نشط", "bg-emerald-50 text-emerald-800"],
  inactive: ["غير نشط", "bg-slate-100 text-slate-700"],
  suspended: ["موقوف", "bg-amber-50 text-amber-800"],
};

const input = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700";

export default function ContractorDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const c = CONTRACTORS.find((item) => String(item.id) === String(id)) ?? CONTRACTORS[0];
  const [links, setLinks] = useState(LINKS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ projectId: "", contractNumber: "", startDate: "", endDate: "" });

  const available = PROJECTS.filter((p) => !links.some((l) => l.projectId === p.id));
  const projectName = (id) => PROJECTS.find((p) => p.id === id)?.name;

  const addLink = () => {
    if (!form.projectId) return;
    setLinks([...links, { ...form, id: Date.now(), projectId: Number(form.projectId) }]);
    setForm({ projectId: "", contractNumber: "", startDate: "", endDate: "" });
    setShowForm(false);
  };

  const info = [
    ["الاسم القانوني", c.legalName],
    ["مسؤول التواصل", c.contactName],
    ["الجوال", c.phone],
    ["البريد الإلكتروني", c.email],
    ["رقم حساب بلدي", c.baladiAccountId],
    ["تاريخ الإضافة", c.createdAt],
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto w-full max-w-7xl">
        <Breadcrumb>
          <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
          <Breadcrumb.Link to="/dashboard/contractors">المقاولون</Breadcrumb.Link>
          <Breadcrumb.Current>{c.commercialName}</Breadcrumb.Current>
        </Breadcrumb>
        <button onClick={() => navigate("/dashboard/contractors")} className="mb-4 text-sm text-teal-700 hover:underline">
          ‹ العودة إلى المقاولين
        </button>

        {/* الترويسة */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{c.commercialName}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS[c.status][1]}`}>{STATUS[c.status][0]}</span>
          </div>
          <button
            onClick={() => navigate(`/dashboard/contractors/edit/${c.id}`)}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm"
          >
            تعديل
          </button>
        </div>

        {/* البيانات الأساسية */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 font-bold">البيانات الأساسية</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {info.map(([label, value]) => (
              <div key={label}>
                <div className="text-xs text-slate-500">{label}</div>
                <div className="mt-0.5 text-sm font-medium">{value || "—"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* المشاريع المرتبطة */}
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-bold">المشاريع المرتبطة ({links.length})</h2>
            {available.length > 0 && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
              >
                {showForm ? "إغلاق" : "ربط بمشروع"}
              </button>
            )}
          </div>

          {showForm && (
            <div className="grid gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4 sm:grid-cols-2 lg:grid-cols-5">
              <select className={input} value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                <option value="">اختر المشروع</option>
                {available.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                className={input}
                placeholder="رقم العقد"
                value={form.contractNumber}
                onChange={(e) => setForm({ ...form, contractNumber: e.target.value })}
              />
              <input
                type="date"
                className={input}
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
              <input type="date" className={input} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              <button onClick={addLink} className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                ربط
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-3 text-start">المشروع</th>
                  <th className="px-6 py-3 text-start">رقم العقد</th>
                  <th className="px-6 py-3 text-start">بداية العقد</th>
                  <th className="px-6 py-3 text-start">نهاية العقد</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {links.map((l) => (
                  <tr key={l.id}>
                    <td className="px-6 py-3 font-medium">{projectName(l.projectId)}</td>
                    <td className="px-6 py-3">{l.contractNumber || "—"}</td>
                    <td className="px-6 py-3">{l.startDate || "—"}</td>
                    <td className="px-6 py-3">{l.endDate || "—"}</td>
                    <td className="px-6 py-3 text-end">
                      <button onClick={() => setLinks(links.filter((x) => x.id !== l.id))} className="text-red-600 hover:underline">
                        فك الربط
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {links.length === 0 && <p className="py-10 text-center text-sm text-slate-500">غير مرتبط بأي مشروع</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
