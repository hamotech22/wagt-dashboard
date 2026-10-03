import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import StatusBadge from "./StatusBadge";

const API_URL = "http://localhost:3000";

const fetchSites = () => axios.get(`${API_URL}/sites`).then((response) => response.data);
const fetchLookups = () =>
  axios
    .all([axios.get(`${API_URL}/projects`), axios.get(`${API_URL}/wasteTypesRef`), axios.get(`${API_URL}/gates`)])
    .then(([projectsRes, wasteTypesRes, gatesRes]) => ({
      projects: projectsRes?.data ?? [],
      wasteTypes: wasteTypesRes?.data ?? [],
      gates: gatesRes?.data ?? [],
    }));
const deleteSite = (id) => axios.delete(`${API_URL}/sites/${id}`).then((response) => response.data);

export default function SitesList() {
  const [sites, setSites] = useState([]);
  const [lookups, setLookups] = useState({ projects: [], wasteTypes: [], gates: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([fetchSites(), fetchLookups()])
      .then(([sitesData, lookupsData]) => {
        setSites(sitesData);
        setLookups(lookupsData);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([fetchSites(), fetchLookups()])
      .then(([sitesData, lookupsData]) => {
        setSites(sitesData);
        setLookups(lookupsData);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      sites.filter(
        (s) =>
          (!search ||
            (s.nameAr || s.name || "").includes(search) ||
            (s.nameEn || "").toLowerCase().includes(search.toLowerCase()) ||
            (s.finalDestinationCode || "").includes(search)) &&
          (!status || (s.status || (s.active ? "active" : "inactive")) === status) &&
          (!projectId || String(s.projectId) === projectId),
      ),
    [sites, search, status, projectId],
  );

  const projectName = (id) => lookups.projects.find((p) => String(p.id) === String(id))?.name || "-";
  const wasteName = (code) => lookups.wasteTypes.find((w) => String(w.code) === String(code))?.name || code;

  const handleDelete = (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الموقع؟")) return;
    deleteSite(id)
      .then(load)
      .catch(() => setError(true));
  };

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Current>المواقع</Breadcrumb.Current>
      </Breadcrumb>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المواقع</h1>
          <p className="text-sm text-gray-500">المرادم ونقاط التخلص النهائي</p>
        </div>
        <Link to="/dashboard/sites/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
          + إضافة موقع
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو كود نقطة التخلص..."
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">كل المشاريع</option>
          {lookups.projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="maintenance">صيانة</option>
          <option value="inactive">غير نشط</option>
        </select>
      </div>

      {/* Table */}
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

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  لا توجد مواقع
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={8} role="alert" className="p-8 text-center text-red-600">
                  تعذّر تحميل المواقع. تحقق من تشغيل json-server ثم أعد تحميل الصفحة.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              filtered.map((s) => {
                const currentCapacity = Number(s.currentCapacity) || 0;
                const totalCapacity = Number(s.totalCapacity) || 0;
                const pct = totalCapacity ? Math.min(100, Math.round((currentCapacity / totalCapacity) * 100)) : 0;
                const wasteTypeCodes = Array.isArray(s.wasteTypeCodes) ? s.wasteTypeCodes : [];
                const siteStatus = s.status || (s.active ? "active" : "inactive");
                const hasCapacity = s.totalCapacity != null && s.totalCapacity !== "";
                return (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium text-gray-800">{s.nameAr || s.name || "موقع بدون اسم"}</div>
                      <div className="text-xs text-gray-400" dir="ltr">
                        {s.nameEn || ""}
                      </div>
                    </td>
                    <td className="p-3">{projectName(s.projectId)}</td>
                    <td className="p-3 font-mono text-xs" dir="ltr">
                      {s.finalDestinationCode}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {wasteTypeCodes.length
                          ? wasteTypeCodes.map((c) => (
                              <span key={c} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                                {wasteName(c)}
                              </span>
                            ))
                          : "-"}
                      </div>
                    </td>
                    <td className="p-3 w-40">
                      {hasCapacity ? (
                        <>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{pct}%</div>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3">
                      {s.gatesCount ?? lookups.gates.filter((gate) => String(gate.siteId) === String(s.id)).length}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={siteStatus} />
                    </td>
                    <td className="p-3">
                      <div className="flex gap-3 text-xs">
                        <Link to={`/dashboard/sites/${s.id}`} className="text-blue-600 hover:underline">
                          عرض
                        </Link>
                        <Link to={`/dashboard/sites/edit/${s.id}`} className="text-green-600 hover:underline">
                          تعديل
                        </Link>
                        <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">
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
