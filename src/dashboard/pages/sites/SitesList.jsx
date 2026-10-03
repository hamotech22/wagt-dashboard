import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import StatusBadge from "./StatusBadge";

const API_URL = "http://localhost:3000";

const selectCls = "border rounded-lg px-3 py-2 text-sm";
const actionBtnCls = "rounded-md border px-2.5 py-1";

export default function SitesList() {
  const [sites, setSites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");

  // جلب البيانات من السيرفر
  const loadData = () => {
    setLoading(true);
    setError(false);

    Promise.all([
      axios.get(`${API_URL}/sites`),
      axios.get(`${API_URL}/projects`),
      axios.get(`${API_URL}/wasteTypesRef`),
      axios.get(`${API_URL}/gates`),
    ])
      .then(([sitesRes, projectsRes, wasteTypesRes, gatesRes]) => {
        setSites(sitesRes.data);
        setProjects(projectsRes.data);
        setWasteTypes(wasteTypesRes.data);
        setGates(gatesRes.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // حذف موقع
  const handleDelete = (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الموقع؟")) return;
    axios
      .delete(`${API_URL}/sites/${id}`)
      .then(loadData)
      .catch(() => setError(true));
  };

  // اسم المشروع من رقمه
  const getProjectName = (id) => {
    const project = projects.find((p) => String(p.id) === String(id));
    return project ? project.name : "-";
  };

  // اسم نوع النفايات من الكود
  const getWasteName = (code) => {
    const waste = wasteTypes.find((w) => String(w.code) === String(code));
    return waste ? waste.name : code;
  };

  // عدد البوابات في الموقع
  const getGatesCount = (siteId) => gates.filter((g) => String(g.siteId) === String(siteId)).length;

  // الفلترة
  const filtered = sites.filter((s) => {
    const text = search.toLowerCase();
    const matchSearch =
      !search ||
      (s.nameAr || "").includes(search) ||
      (s.nameEn || "").toLowerCase().includes(text) ||
      (s.finalDestinationCode || "").includes(search);

    const matchStatus = !status || s.status === status;
    const matchProject = !projectId || String(s.projectId) === projectId;

    return matchSearch && matchStatus && matchProject;
  });

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Current>المواقع</Breadcrumb.Current>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المواقع</h1>
          <p className="text-sm text-gray-500">المرادم ونقاط التخلص النهائي</p>
        </div>
        <Link to="/dashboard/sites/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + إضافة موقع
        </Link>
      </div>

      {/* الفلاتر */}
      <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو كود نقطة التخلص..."
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={selectCls}>
          <option value="">كل المشاريع</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="maintenance">صيانة</option>
          <option value="inactive">غير نشط</option>
        </select>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">الموقع</th>
              <th className="p-3">المشروع</th>
              <th className="p-3">كود نقطة التخلص</th>
              <th className="p-3">أنواع النفايات</th>
              <th className="p-3">السعة</th>
              <th className="p-3">البوابات</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  جارِ التحميل...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-red-600">
                  تعذّر تحميل المواقع. تحقق من تشغيل json-server ثم أعد تحميل الصفحة.
                </td>
              </tr>
            )}

            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  لا توجد مواقع
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              filtered.map((s) => {
                const pct = s.totalCapacity ? Math.min(100, Math.round((s.currentCapacity / s.totalCapacity) * 100)) : 0;
                const barColor = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-green-500";

                return (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium text-gray-800">{s.nameAr}</div>
                      <div className="text-xs text-gray-400" dir="ltr">
                        {s.nameEn}
                      </div>
                    </td>
                    <td className="p-3">{getProjectName(s.projectId)}</td>
                    <td className="p-3 font-mono text-xs" dir="ltr">
                      {s.finalDestinationCode}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {(s.wasteTypeCodes || []).map((c) => (
                          <span key={c} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                            {getWasteName(c)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 w-40">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{pct}%</div>
                    </td>
                    <td className="p-3">{getGatesCount(s.id)}</td>
                    <td className="p-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-xs">
                        <Link
                          to={`/dashboard/sites/${s.id}`}
                          className={`${actionBtnCls} border-gray-200 text-gray-700 hover:bg-gray-50`}
                        >
                          عرض
                        </Link>
                        <Link
                          to={`/dashboard/sites/edit/${s.id}`}
                          className={`${actionBtnCls} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
                        >
                          تعديل
                        </Link>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className={`${actionBtnCls} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}