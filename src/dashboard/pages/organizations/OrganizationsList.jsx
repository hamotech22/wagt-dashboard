import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

const statuses = {
  all: { label: "الكل", style: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200" },
  active: { label: "نشطة", style: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200" },
  inactive: { label: "غير نشطة", style: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200" },
};

const organizationsApi = {
  list: () => axios.get(`${API_URL}/organizations`).then((response) => response.data),
  subMunicipalities: () => axios.get(`${API_URL}/subMunicipalities`).then((response) => response.data),
  projects: () => axios.get(`${API_URL}/projects`).then((response) => response.data),
  remove: (id) => axios.delete(`${API_URL}/organizations/${id}`).then((response) => response.data),
};

const PAGE_SIZE = 8;

export default function OrganizationsList() {
  const navigate = useNavigate();

  // state
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [toDelete, setToDelete] = useState(null); // الجهة المطلوب حذفها
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text }

  // API: تحميل البيانات (يُعاد عند تغيير reloadKey)
  useEffect(() => {
    Promise.all([organizationsApi.list(), organizationsApi.subMunicipalities(), organizationsApi.projects()])
      .then(([list, subMunicipalities, projects]) => {
        setError("");
        setOrganizations(
          list.map((organization) => ({
            ...organization,
            subMunicipalitiesCount: subMunicipalities.filter(
              (subMunicipality) => String(subMunicipality.organizationId) === String(organization.id),
            ).length,
            projectsCount: projects.filter(
              (project) => String(project.municipalityId) === String(organization.id),
            ).length,
          })),
        );
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
      await organizationsApi.remove(toDelete.id);
      setOrganizations(organizations.filter((o) => o.id !== toDelete.id));
      setNotice({ type: "success", text: "تم حذف الجهة" });
    } catch (err) {
      setNotice({ type: "error", text: err.message || "فشل حذف الجهة" });
    }
    setToDelete(null);
    setBusy(false);
  };

  // البحث والفلترة والترقيم
  const query = search.trim().toLowerCase();
  const filtered = organizations.filter(
    (o) =>
      (status === "all" || o.status === status) &&
      (!query || [o.name, o.code, o.city, o.municipalityCode].some((v) => (v ?? "").toLowerCase().includes(query))),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Current>الجهات والبلديات</Breadcrumb.Current>
      </Breadcrumb>
      <div>
        <h1 className="text-xl font-bold text-slate-900">إدارة الجهات والبلديات</h1>
        <p className="mt-1 text-sm text-slate-500">الجهات المستفيدة والبلديات وربطها بالبلديات الفرعية والمشاريع.</p>
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
          ["إجمالي الجهات", organizations.length],
          ["نشطة", organizations.filter((o) => o.status === "active").length],
          ["غير نشطة", organizations.filter((o) => o.status === "inactive").length],
          ["إجمالي المشاريع", organizations.reduce((sum, o) => sum + o.projectsCount, 0)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-blue-900 dark:text-sky-200">{value}</p>
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
              placeholder="بحث باسم الجهة أو الرمز أو المدينة"
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
              {Object.entries(statuses)
                .filter(([value]) => value !== "all")
                .map(([value, s]) => (
                  <option key={value} value={value}>
                    {s.label}
                  </option>
                ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard/organizations/add")}
            className="h-10 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:bg-sky-500 dark:hover:bg-sky-400 dark:focus-visible:ring-offset-slate-900"
          >
            + إضافة جهة
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
            <p className="font-medium text-slate-800">تعذّر تحميل الجهات</p>
            <p className="text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
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
                    <th className="px-4 py-3 font-medium">الجهة</th>
                    <th className="px-4 py-3 font-medium">النطاق الفرعي</th>
                    <th className="px-4 py-3 font-medium">الرمز</th>
                    <th className="px-4 py-3 font-medium">المدينة</th>
                    <th className="px-4 py-3 font-medium">كود البلدية (مدينتي)</th>
                    <th className="px-4 py-3 font-medium">البلديات الفرعية</th>
                    <th className="px-4 py-3 font-medium">المشاريع</th>
                    <th className="px-4 py-3 font-medium">الحالة</th>
                    <th className="px-4 py-3 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                        لا توجد جهات مطابقة للبحث الحالي.
                      </td>
                    </tr>
                  )}

                  {rows.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{o.name}</p>
                        <p className="text-xs text-slate-500">{o.region}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span dir="ltr" className="inline-block font-mono text-xs text-blue-700">
                          /{o.slug}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span dir="ltr" className="inline-block">
                          {o.code}
                        </span>
                      </td>
                      <td className="px-4 py-3">{o.city || "—"}</td>
                      <td className="px-4 py-3">
                        <span dir="ltr" className="inline-block">
                          {o.municipalityCode || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{o.subMunicipalitiesCount}</td>
                      <td className="px-4 py-3">{o.projectsCount}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statuses[o.status]?.style}`}>
                          {statuses[o.status]?.label ?? o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/dashboard/organizations/${o.id}`)}
                            className="min-h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            عرض
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/dashboard/organizations/edit/${o.id}`)}
                            className="min-h-9 rounded-lg border border-sky-200 bg-sky-50 px-3 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200 dark:hover:bg-sky-900"
                          >
                            تعديل
                          </button>
                          <button
                            type="button"
                            onClick={() => setToDelete(o)}
                            className="min-h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-900"
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
                  className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  السابق
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
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
            <h3 className="text-lg font-bold text-slate-900">حذف الجهة</h3>
            <p className="mt-2 text-sm text-slate-600">سيتم حذف "{toDelete.name}". لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setToDelete(null)}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleDelete}
                className="h-10 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
              >
                {busy ? "جارٍ الحذف..." : "حذف الجهة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
