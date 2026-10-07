import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

const STATUS = {
  active: ["نشط", "bg-green-50 text-green-700"],
  inactive: ["غير نشط", "bg-gray-100 text-gray-700"],
  suspended: ["موقوف", "bg-yellow-50 text-yellow-700"],
};

const selectCls = "border rounded-lg px-3 py-2 text-sm";
const actionBtnCls = "rounded-md border px-2.5 py-1";

async function fetchContractorData() {
  const [contractorsResponse, projectsResponse] = await Promise.all([
    axios.get(`${API_URL}/contractors`),
    axios.get(`${API_URL}/projects`),
  ]);

  if (!Array.isArray(contractorsResponse.data) || !Array.isArray(projectsResponse.data)) {
    throw new Error("The contractors or projects API returned an invalid response.");
  }

  return {
    contractors: contractorsResponse.data,
    projects: projectsResponse.data,
  };
}

export default function ContractorsList() {
  const [contractors, setContractors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const loadData = async () => {
    try {
      const data = await fetchContractorData();
      setLoadError("");
      setContractors(data.contractors);
      setProjects(data.projects);
    } catch (error) {
      console.error("Failed to load contractors:", error);
      setLoadError("تعذر تحميل بيانات المقاولين. حاول تحديث الصفحة.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    fetchContractorData()
      .then((data) => {
        if (!active) return;
        setContractors(data.contractors);
        setProjects(data.projects);
      })
      .catch((error) => {
        console.error("Failed to load contractors:", error);
        if (active) setLoadError("تعذر تحميل بيانات المقاولين. حاول تحديث الصفحة.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // حذف مقاول
  const handleDelete = (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المقاول؟")) return;
    setLoading(true);
    axios
      .delete(`${API_URL}/contractors/${id}`)
      .then(loadData)
      .catch((error) => {
        console.error("Failed to delete contractor:", error);
        setLoadError("تعذر حذف المقاول. حاول مرة أخرى.");
      });
  };

  // عدد المشاريع المرتبطة بالمقاول
  const getProjectsCount = (contractorId) =>
    projects.filter((project) => (project.contractorIds ?? []).some((id) => String(id) === String(contractorId))).length;

  // الفلترة
  const filtered = contractors.filter((c) => {
    const matchSearch = !search || `${c.commercialName ?? c.name ?? ""} ${c.legalName ?? ""} ${c.baladiAccountId ?? ""}`.includes(search.trim());
    const matchStatus = !status || c.status === status;

    return matchSearch && matchStatus;
  });

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Current>المقاولون</Breadcrumb.Current>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المقاولين</h1>
          <p className="text-sm text-gray-500">{filtered.length} مقاول</p>
        </div>
        <Link to="/dashboard/contractors/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + إضافة مقاول
        </Link>
      </div>

      {/* الفلاتر */}
      <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو رقم حساب بلدي..."
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
          <option value="suspended">موقوف</option>
        </select>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">المقاول</th>
              <th className="p-3">مسؤول التواصل</th>
              <th className="p-3">رقم حساب بلدي</th>
              <th className="p-3">المشاريع</th>
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

            {!loading && loadError && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-red-600">
                  {loadError}
                </td>
              </tr>
            )}

            {!loading && !loadError && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  لا يوجد مقاولون مطابقون
                </td>
              </tr>
            )}

            {!loading &&
              !loadError &&
              filtered.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium text-gray-800">{c.commercialName ?? c.name ?? c.legalName ?? "—"}</div>
                    {c.legalName && <div className="text-xs text-gray-400">{c.legalName}</div>}
                  </td>
                  <td className="p-3">
                    <div>{c.contactName || <span className="text-gray-400">غير مسجل</span>}</div>
                    <div className="text-xs text-gray-400" dir="ltr">
                      {c.phone || "—"}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-xs" dir="ltr">
                    {c.baladiAccountId || <span className="font-sans text-gray-400">غير مسجل</span>}
                  </td>
                  <td className="p-3">{getProjectsCount(c.id)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${STATUS[c.status]?.[1] ?? "bg-gray-100 text-gray-700"}`}>
                      {STATUS[c.status]?.[0] ?? c.status ?? "غير محدد"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Link to={`/dashboard/contractors/${c.id}`} className={`${actionBtnCls} border-gray-200 text-gray-700 hover:bg-gray-50`}>
                        عرض
                      </Link>
                      <Link to={`/dashboard/contractors/edit/${c.id}`} className={`${actionBtnCls} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}>
                        تعديل
                      </Link>
                      <button onClick={() => handleDelete(c.id)} className={`${actionBtnCls} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}>
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}