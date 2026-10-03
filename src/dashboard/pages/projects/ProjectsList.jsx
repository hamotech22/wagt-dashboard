import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";
const PAGE_SIZE = 8;

const statuses = {
  active: { label: "نشط", style: "bg-emerald-100 text-emerald-700" },
  pending: { label: "قيد التنفيذ", style: "bg-amber-100 text-amber-700" },
  completed: { label: "مكتمل", style: "bg-blue-100 text-blue-700" },
};

const selectCls = "border rounded-lg px-3 py-2 text-sm";

// أنماط الأزرار
const pageBtnCls = "border rounded-lg px-3 py-1 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed";
const actionBtnCls = "rounded-md border px-2.5 py-1";

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [municipalityId, setMunicipalityId] = useState("");
  const [page, setPage] = useState(1);

  const [toDelete, setToDelete] = useState(null); // المشروع المطلوب حذفه
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text }

  // جلب البيانات من السيرفر
  const loadData = () => {
    setLoading(true);
    setError("");

    Promise.all([axios.get(`${API_URL}/projects`), axios.get(`${API_URL}/municipalities`), axios.get(`${API_URL}/contractors`)])
      .then(([projectsRes, municipalitiesRes, contractorsRes]) => {
        setProjects(projectsRes.data);
        setMunicipalities(municipalitiesRes.data);
        setContractors(contractorsRes.data);
      })
      .catch((err) => setError(err.message || "تعذّر تحميل البيانات"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // تغيير فلتر مع الرجوع للصفحة الأولى
  const changeFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };

  // حذف مشروع
  const handleDelete = async () => {
    setBusy(true);
    try {
      await axios.delete(`${API_URL}/projects/${toDelete.id}`);
      setProjects(projects.filter((p) => p.id !== toDelete.id));
      // لو حذفنا آخر عنصر في الصفحة الأخيرة نرجع صفحة للخلف
      setPage((p) => Math.min(p, Math.max(1, Math.ceil((projects.length - 1) / PAGE_SIZE))));
      setNotice({ type: "success", text: "تم حذف المشروع" });
    } catch (err) {
      setNotice({ type: "error", text: err.message || "فشل حذف المشروع" });
    }
    setToDelete(null);
    setBusy(false);
  };

  // اسم البلدية من رقمها
  const getMunicipalityName = (id) => {
    const municipality = municipalities.find((m) => String(m.id) === String(id));
    return municipality ? municipality.name : "—";
  };

  // أسماء مقاولين المشروع
  const getContractorNames = (project) =>
    (project.contractorIds || [])
      .map((cid) => contractors.find((c) => String(c.id) === String(cid))?.name)
      .filter(Boolean)
      .join("، ") || "—";

  // الفلترة
  const text = search.trim().toLowerCase();
  const filtered = projects.filter((p) => {
    const matchSearch = !text || [p.name, p.code, p.contractNumber].some((v) => (v || "").toLowerCase().includes(text));
    const matchStatus = !status || p.status === status;
    const matchMunicipality = !municipalityId || String(p.municipalityId) === municipalityId;

    return matchSearch && matchStatus && matchMunicipality;
  });

  // الترقيم
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Current>المشاريع</Breadcrumb.Current>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المشاريع</h1>
          <p className="text-sm text-gray-500">المشاريع التعاقدية وربطها بالبلديات والمقاولين والمواقع.</p>
        </div>
        <Link to="/dashboard/projects/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + إضافة مشروع
        </Link>
      </div>

      {/* رسالة النجاح / الخطأ */}
      {notice && (
        <div
          className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm ${
            notice.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {notice.text}
          <button onClick={() => setNotice(null)} className="text-xs underline">
            إغلاق
          </button>
        </div>
      )}

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="إجمالي المشاريع" value={projects.length} color="text-gray-800" />
        <StatCard label="نشطة" value={projects.filter((p) => p.status === "active").length} color="text-green-600" />
        <StatCard label="قيد التنفيذ" value={projects.filter((p) => p.status === "pending").length} color="text-yellow-600" />
        <StatCard label="مكتملة" value={projects.filter((p) => p.status === "completed").length} color="text-blue-600" />
      </div>

      {/* الفلاتر */}
      <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={search}
          onChange={(e) => changeFilter(setSearch, e.target.value)}
          placeholder="بحث باسم المشروع أو الكود..."
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select value={status} onChange={(e) => changeFilter(setStatus, e.target.value)} className={selectCls}>
          <option value="">كل الحالات</option>
          {Object.entries(statuses).map(([value, s]) => (
            <option key={value} value={value}>
              {s.label}
            </option>
          ))}
        </select>

        <select value={municipalityId} onChange={(e) => changeFilter(setMunicipalityId, e.target.value)} className={selectCls}>
          <option value="">كل البلديات</option>
          {municipalities.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {error ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <p className="font-medium text-gray-800">تعذّر تحميل المشاريع</p>
            <p className="text-sm text-gray-500">{error}</p>
            <button onClick={loadData} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">المشروع</th>
                <th className="p-3">الكود</th>
                <th className="p-3">البلدية</th>
                <th className="p-3">المقاول</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    جارِ التحميل...
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    لا توجد مشاريع مطابقة للبحث الحالي.
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium text-gray-800">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.contractNumber}</div>
                    </td>
                    <td className="p-3">{p.code}</td>
                    <td className="p-3">{getMunicipalityName(p.municipalityId)}</td>
                    <td className="p-3">{getContractorNames(p)}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statuses[p.status]?.style}`}>
                        {statuses[p.status]?.label ?? p.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-xs">
                        <Link
                          to={`/dashboard/projects/${p.id}`}
                          className={`${actionBtnCls} border-gray-200 text-gray-700 hover:bg-gray-50`}
                        >
                          عرض
                        </Link>
                        <Link
                          to={`/dashboard/projects/edit/${p.id}`}
                          className={`${actionBtnCls} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
                        >
                          تعديل
                        </Link>
                        <button
                          onClick={() => setToDelete(p)}
                          className={`${actionBtnCls} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* الترقيم */}
        {!loading && !error && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-gray-600">
            <span>
              الصفحة {page} من {totalPages}
            </span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={pageBtnCls}>
                السابق
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className={pageBtnCls}>
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* نافذة تأكيد الحذف */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800">حذف المشروع</h3>
            <p className="mt-2 text-sm text-gray-600">سيتم حذف "{toDelete.name}". لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                disabled={busy}
                onClick={() => setToDelete(null)}
                className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                إلغاء
              </button>
              <button
                disabled={busy}
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium"
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