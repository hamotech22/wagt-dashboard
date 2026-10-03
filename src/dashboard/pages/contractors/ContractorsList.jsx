import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">إدارة المقاولين</h1>
            <p className="text-sm text-slate-500">{filtered.length} مقاول</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/contractors/add")}
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
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
                    <button onClick={() => navigate(`/dashboard/contractors/${c.id}`)} className="text-teal-700 hover:underline">
                      التفاصيل
                    </button>
                    <button onClick={() => go("edit", c.id)} className="mr-4 text-teal-700 hover:underline">
                      تعديل
                    </button>
                    <button onClick={() => setToDelete(c)} className="mr-4 text-red-600 hover:underline">
                      حذف
                    </button>
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
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-2 font-bold">حذف المقاول</h3>
            <p className="text-sm text-slate-600">سيتم حذف «{toDelete.commercialName}». لا يمكن التراجع عن ذلك.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setToDelete(null)} className="rounded-md border border-slate-300 px-4 py-2 text-sm">
                إلغاء
              </button>
              <button
                onClick={() => {
                  setItems(items.filter((c) => c.id !== toDelete.id));
                  setToDelete(null);
                }}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white"
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
