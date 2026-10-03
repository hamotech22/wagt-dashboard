import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

const statuses = {
  active: { label: "نشط", style: "bg-emerald-100 text-emerald-700" },
  pending: { label: "قيد التنفيذ", style: "bg-amber-100 text-amber-700" },
  completed: { label: "مكتمل", style: "bg-sky-100 text-sky-700" },
};

const projectsApi = {
  list: () => axios.get(`${API_URL}/projects`).then((response) => response.data),
  lookups: () =>
    axios
      .all([axios.get(`${API_URL}/municipalities`), axios.get(`${API_URL}/contractors`)])
      .then(([municipalitiesRes, contractorsRes]) => ({ municipalities: municipalitiesRes.data, contractors: contractorsRes.data })),
  remove: (id) => axios.delete(`${API_URL}/projects/${id}`).then((response) => response.data),
};

const PAGE_SIZE = 8;

export default function ProjectsList() {
  const navigate = useNavigate();

  // state
  const [projects, setProjects] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [municipalityId, setMunicipalityId] = useState("all");
  const [page, setPage] = useState(1);

  const [toDelete, setToDelete] = useState(null); // المشروع المطلوب حذفه
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text }

  // API: تحميل البيانات (يُعاد عند تغيير reloadKey)
  useEffect(() => {
    Promise.all([projectsApi.list(), projectsApi.lookups()])
      .then(([list, lookups]) => {
        setProjects(list);
        setMunicipalities(lookups.municipalities);
        setContractors(lookups.contractors);
        setError("");
      })
      .catch((err) => setError(err.message || "تعذّر تحميل البيانات"))
      .finally(() => setLoading(false));
  }, [reloadKey]);

  // functions
  const reload = () => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await projectsApi.remove(toDelete.id);
      setProjects(projects.filter((p) => p.id !== toDelete.id));
      setNotice({ type: "success", text: "تم حذف المشروع" });
    } catch (err) {
      setNotice({ type: "error", text: err.message || "فشل حذف المشروع" });
    }
    setToDelete(null);
    setBusy(false);
  };

  // البحث والفلترة والترقيم
  const query = search.trim().toLowerCase();
  const filtered = projects.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      (municipalityId === "all" || String(p.municipalityId) === municipalityId) &&
      (!query || [p.name, p.code, p.contractNumber].some((v) => v.toLowerCase().includes(query))),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Current>المشاريع</Breadcrumb.Current>
      </Breadcrumb>
      <div>
        <h1 className="text-xl font-bold text-slate-900">إدارة المشاريع</h1>
        <p className="mt-1 text-sm text-slate-500">المشاريع التعاقدية وربطها بالبلديات والمقاولين والمواقع.</p>
      </div>

      {notice && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm ${
            notice.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {notice.text}
          <button type="button" onClick={() => setNotice(null)} className="text-xs underline">
            إغلاق
          </button>
        </div>
      )}

      {/* البطاقات */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["إجمالي المشاريع", projects.length, "bg-sky-50 text-sky-700"],
          ["نشطة", projects.filter((p) => p.status === "active").length, "bg-emerald-50 text-emerald-700"],
          ["قيد التنفيذ", projects.filter((p) => p.status === "pending").length, "bg-amber-50 text-amber-700"],
          ["مكتملة", projects.filter((p) => p.status === "completed").length, "bg-blue-50 text-blue-700"],
        ].map(([label, value, tone]) => (
          <div key={label} className={`rounded-xl border border-slate-200 p-4 ${tone}`}>
            <p className="text-sm">{label}</p>
            <p className="mt-3 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70">
        {/* شريط الأدوات */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="بحث باسم المشروع أو الكود"
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 md:w-72"
            />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-400"
            >
              <option value="all">كل الحالات</option>
              {Object.entries(statuses).map(([value, s]) => (
                <option key={value} value={value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              value={municipalityId}
              onChange={(e) => {
                setMunicipalityId(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-400"
            >
              <option value="all">كل البلديات</option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard/projects/add")}
            className="h-10 rounded-lg bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-500"
          >
            + إضافة مشروع
          </button>
        </div>

        {/* التحميل */}
        {loading && (
          <div className="animate-pulse space-y-3 p-5" aria-busy="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-12 rounded-lg bg-slate-100" />
            ))}
          </div>
        )}

        {/* الخطأ */}
        {error && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <p className="font-medium text-slate-800">تعذّر تحميل المشاريع</p>
            <p className="text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="h-10 rounded-lg border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-50"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* الجدول */}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-right">
                <thead className="bg-slate-50 text-sm text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">المشروع</th>
                    <th className="px-4 py-3 font-medium">الكود</th>
                    <th className="px-4 py-3 font-medium">البلدية</th>
                    <th className="px-4 py-3 font-medium">المقاول</th>
                    <th className="px-4 py-3 font-medium">الحالة</th>
                    <th className="px-4 py-3 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                        لا توجد مشاريع مطابقة للبحث الحالي.
                      </td>
                    </tr>
                  )}

                  {rows.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.contractNumber}</p>
                      </td>
                      <td className="px-4 py-3">{p.code}</td>
                      <td className="px-4 py-3">
                        {municipalities.find((m) => String(m.id) === String(p.municipalityId))?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {(
                          Array.isArray(p.contractorIds)
                            ? p.contractorIds
                            : p.contractorId != null
                              ? [p.contractorId]
                              : []
                        )
                          .map((contractorId) => contractors.find((c) => String(c.id) === String(contractorId))?.name)
                          .filter(Boolean)
                          .join("، ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statuses[p.status]?.style}`}>
                          {statuses[p.status]?.label ?? p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/dashboard/projects/${p.id}`)}
                            className="rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                          >
                            عرض
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/dashboard/projects/edit/${p.id}`)}
                            className="rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-xs text-sky-700 hover:bg-sky-100"
                          >
                            تعديل
                          </button>
                          <button
                            type="button"
                            onClick={() => setToDelete(p)}
                            className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* الترقيم */}
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
              <span>
                الصفحة {page} من {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="h-9 rounded-lg border border-slate-200 px-3 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  السابق
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="h-9 rounded-lg border border-slate-200 px-3 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  التالي
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* نافذة تأكيد الحذف */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">حذف المشروع</h3>
            <p className="mt-2 text-sm text-slate-600">سيتم حذف "{toDelete.name}". لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setToDelete(null)}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm text-slate-700"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleDelete}
                className="h-10 rounded-lg bg-red-600 px-4 text-sm font-medium text-white disabled:opacity-60"
              >
                {busy ? "جارٍ الحذف..." : "حذف المشروع"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
