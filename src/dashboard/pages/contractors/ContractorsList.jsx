import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import AddContractor from "./AddContractor";
import EditContractor from "./EditContractor";

const DATA = [
  {
    id: 1,
    commercialName: "الأفق البيئية",
    legalName: "شركة الأفق للمقاولات والخدمات البيئية",
    contactName: "خالد العسيري",
    phone: "0501234567",
    email: "info@ofoq.example",
    baladiAccountId: "778120",
    projectsCount: 2,
    status: "active",
  },
  {
    id: 2,
    commercialName: "نجران للنقل",
    legalName: "مؤسسة نجران للنقل والتخلص من النفايات",
    contactName: "سعيد اليامي",
    phone: "0559876543",
    email: "",
    baladiAccountId: "778455",
    projectsCount: 1,
    status: "active",
  },
  {
    id: 3,
    commercialName: "الربوع",
    legalName: "شركة الربوع للمقاولات العامة",
    contactName: "محمد الشهري",
    phone: "0533344556",
    email: "",
    baladiAccountId: "",
    projectsCount: 0,
    status: "suspended",
  },
  {
    id: 4,
    commercialName: "البنيان الحديثة",
    legalName: "شركة البنيان الحديثة للمقاولات",
    contactName: "فهد القحطاني",
    phone: "0544455667",
    email: "",
    baladiAccountId: "779010",
    projectsCount: 3,
    status: "active",
  },
  {
    id: 5,
    commercialName: "الرواد للنظافة",
    legalName: "مؤسسة الرواد للنظافة والصيانة",
    contactName: "عبدالله المرّي",
    phone: "0566677889",
    email: "",
    baladiAccountId: "779342",
    projectsCount: 1,
    status: "inactive",
  },
  {
    id: 6,
    commercialName: "الصفوة",
    legalName: "شركة الصفوة للخدمات البلدية",
    contactName: "ناصر الدوسري",
    phone: "0577788990",
    email: "",
    baladiAccountId: "780215",
    projectsCount: 2,
    status: "active",
  },
];

const STATUS = {
  active: ["نشط", "bg-emerald-50 text-emerald-800"],
  inactive: ["غير نشط", "bg-slate-100 text-slate-700"],
  suspended: ["موقوف", "bg-amber-50 text-amber-800"],
};

export default function ContractorsList() {
  const navigate = useNavigate();
  const [items, setItems] = useState(DATA);
  const [view, setView] = useState("list"); // list | add | edit
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [toDelete, setToDelete] = useState(null);

  const go = (v, id = null) => {
    setView(v);
    setSelectedId(id);
  };
  const selected = items.find((c) => c.id === selectedId);

  // ---------- الصفحات الأخرى ----------
  if (view === "add")
    return (
      <AddContractor
        onCancel={() => go("list")}
        onSave={(form) => {
          setItems([...items, { ...form, id: Date.now(), projectsCount: 0 }]);
          go("list");
        }}
      />
    );

  if (view === "edit" && selected)
    return (
      <EditContractor
        contractor={selected}
        onCancel={() => go("list")}
        onSave={(form) => {
          setItems(items.map((c) => (c.id === form.id ? form : c)));
          go("list");
        }}
      />
    );

  // ---------- القائمة ----------
  const filtered = items.filter(
    (c) => (status === "all" || c.status === status) && `${c.commercialName} ${c.legalName} ${c.baladiAccountId}`.includes(search.trim()),
  );

  return (
    <div dir="rtl" className="min-h-screen w-full p-6 text-slate-900">
      <div className="w-full">
        <Breadcrumb>
          <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
          <Breadcrumb.Current>المقاولون</Breadcrumb.Current>
        </Breadcrumb>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">إدارة المقاولين</h1>
            <p className="text-sm text-slate-500">{filtered.length} مقاول</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/contractors/add")}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:bg-sky-500 dark:hover:bg-sky-400 dark:focus-visible:ring-offset-slate-900"
          >
            + إضافة مقاول
          </button>
        </div>

        <div className="mb-4 flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو رقم حساب بلدي"
            className="w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
            <option value="suspended">موقوف</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-right">المقاول</th>
                <th className="px-4 py-3 text-right">مسؤول التواصل</th>
                <th className="px-4 py-3 text-right">رقم حساب بلدي</th>
                <th className="px-4 py-3 text-right">المشاريع</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-right">
                    <div className="font-semibold">{c.commercialName}</div>
                    <div className="text-xs text-slate-500">{c.legalName}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>{c.contactName}</div>
                    <div className="text-xs text-slate-500">{c.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-right">{c.baladiAccountId || "—"}</td>
                  <td className="px-4 py-3 text-right">{c.projectsCount}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS[c.status][1]}`}>{STATUS[c.status][0]}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-left">
                    <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/dashboard/contractors/${c.id}`)}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      التفاصيل
                    </button>
                    <button
                      onClick={() => go("edit", c.id)}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 px-3 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200 dark:hover:bg-sky-900"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => setToDelete(c)}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-900"
                    >
                      حذف
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && <p className="py-12 text-center text-sm text-slate-500">لا يوجد مقاولون مطابقون</p>}
        </div>
      </div>

      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-2 font-bold">حذف المقاول</h3>
            <p className="text-sm text-slate-600">سيتم حذف «{toDelete.commercialName}». لا يمكن التراجع عن ذلك.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setToDelete(null)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  setItems(items.filter((c) => c.id !== toDelete.id));
                  setToDelete(null);
                }}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
