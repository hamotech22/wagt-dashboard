import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

const STATUS = {
  active: ["نشط", "bg-green-50 text-green-700"],
  inactive: ["غير نشط", "bg-gray-100 text-gray-700"],
  suspended: ["موقوف", "bg-yellow-50 text-yellow-700"],
};

const inputCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const cardCls = "bg-white rounded-xl shadow-sm";
const actionBtnCls = "rounded-md border px-2.5 py-1";
const primaryBtnCls = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium";

async function fetchContractorDetails(id) {
  const [contractorResponse, projectsResponse] = await Promise.all([
    axios.get(`${API_URL}/contractors/${id}`),
    axios.get(`${API_URL}/projects`),
  ]);

  if (!contractorResponse.data || !Array.isArray(projectsResponse.data)) {
    throw new Error("The contractors or projects API returned an invalid response.");
  }

  return {
    contractor: contractorResponse.data,
    projects: projectsResponse.data,
  };
}

export default function ContractorDetails() {
  const { id } = useParams();

  const projectIdRef = useRef();

  const [contractor, setContractor] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchContractorDetails(id);
      setContractor(data.contractor);
      setProjects(data.projects);
    } catch (loadError) {
      console.error("Failed to load contractor details:", loadError);
      setError("تعذر تحميل بيانات المقاول أو المشاريع المرتبطة.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    fetchContractorDetails(id)
      .then((data) => {
        if (!active) return;
        setContractor(data.contractor);
        setProjects(data.projects);
      })
      .catch((loadError) => {
        console.error("Failed to load contractor details:", loadError);
        if (active) setError("تعذر تحميل بيانات المقاول أو المشاريع المرتبطة.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const contractorProjects = projects.filter((project) =>
    (project.contractorIds ?? []).some((contractorId) => String(contractorId) === String(id)),
  );
  const available = projects.filter(
    (project) => !(project.contractorIds ?? []).some((contractorId) => String(contractorId) === String(id)),
  );

  const addLink = async () => {
    const projectId = projectIdRef.current?.value;
    if (!projectId) return;

    const project = available.find((item) => String(item.id) === projectId);
    if (!project) return;

    setSaving(true);
    setActionError("");
    try {
      await axios.put(`${API_URL}/projects/${project.id}`, {
        ...project,
        contractorIds: [...(project.contractorIds ?? []), Number(id)],
      });
      setShowForm(false);
      await loadData();
    } catch (saveError) {
      console.error("Failed to link contractor to project:", saveError);
      setActionError("تعذر ربط المقاول بالمشروع. حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  const removeLink = async (project) => {
    setSaving(true);
    setActionError("");
    try {
      await axios.put(`${API_URL}/projects/${project.id}`, {
        ...project,
        contractorIds: (project.contractorIds ?? []).filter((contractorId) => String(contractorId) !== String(id)),
      });
      await loadData();
    } catch (saveError) {
      console.error("Failed to unlink contractor from project:", saveError);
      setActionError("تعذر فك ارتباط المقاول بالمشروع. حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div dir="rtl" className="p-6 text-gray-400" aria-busy="true">
        جارِ التحميل...
      </div>
    );
  }

  if (error || !contractor) {
    return (
      <div dir="rtl" className="flex flex-col items-center gap-3 p-16 text-center">
        <p className="font-medium text-gray-800">تعذر فتح بيانات المقاول</p>
        <p className="text-sm text-gray-500">{error || "المقاول غير موجود."}</p>
        <div className="flex gap-2">
          <button onClick={loadData} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
            إعادة المحاولة
          </button>
          <Link to="/dashboard/contractors" className={`${primaryBtnCls} inline-flex items-center`}>
            العودة للمقاولين
          </Link>
        </div>
      </div>
    );
  }

  const info = [
    ["الاسم القانوني", contractor.legalName || contractor.name],
    ["مسؤول التواصل", contractor.contactName],
    ["الجوال", contractor.phone],
    ["البريد الإلكتروني", contractor.email],
    ["رقم حساب بلدي", contractor.baladiAccountId],
    ["تاريخ الإضافة", contractor.createdAt],
  ];

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/contractors">المقاولون</Breadcrumb.Link>
        <Breadcrumb.Current>{contractor.commercialName || contractor.name}</Breadcrumb.Current>
      </Breadcrumb>

      {/* الترويسة */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">{contractor.commercialName || contractor.name}</h1>
          <span className={`px-2 py-0.5 rounded text-xs ${STATUS[contractor.status]?.[1] ?? "bg-gray-100 text-gray-700"}`}>
            {STATUS[contractor.status]?.[0] ?? contractor.status ?? "غير محدد"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link to="/dashboard/contractors" className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg">
            العودة
          </Link>
          <Link to={`/dashboard/contractors/edit/${contractor.id}`} className={primaryBtnCls}>
            تعديل
          </Link>
        </div>
      </div>

      {/* البيانات الأساسية */}
      <div className={cardCls}>
        <div className="border-b px-5 py-3">
          <h2 className="font-semibold text-gray-800">البيانات الأساسية</h2>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {info.map(([label, value]) => (
            <div key={label}>
              <div className="text-xs text-gray-400">{label}</div>
              <div className="mt-0.5 text-sm font-medium text-gray-800">{value || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* المشاريع المرتبطة */}
      <div className={cardCls}>
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="font-semibold text-gray-800">المشاريع المرتبطة ({contractorProjects.length})</h2>
          {available.length > 0 && (
            <button onClick={() => setShowForm(!showForm)} className={primaryBtnCls}>
              {showForm ? "إغلاق" : "ربط بمشروع"}
            </button>
          )}
        </div>

        {showForm && (
          <div className="grid gap-3 border-b bg-gray-50 px-5 py-4 sm:grid-cols-2">
            <select ref={projectIdRef} className={inputCls}>
              <option value="">اختر المشروع</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button onClick={addLink} disabled={saving} className={primaryBtnCls}>
              {saving ? "جارٍ الربط..." : "ربط"}
            </button>
          </div>
        )}
        {actionError && <p role="alert" className="px-5 pt-3 text-sm text-red-600">{actionError}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">المشروع</th>
                <th className="p-3">رقم العقد</th>
                <th className="p-3">بداية العقد</th>
                <th className="p-3">نهاية العقد</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {contractorProjects.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    غير مرتبط بأي مشروع
                  </td>
                </tr>
              )}

              {contractorProjects.map((project) => (
                <tr key={project.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-800">{project.name || "—"}</td>
                  <td className="p-3">{project.contractNumber || "—"}</td>
                  <td className="p-3">{project.startDate || "—"}</td>
                  <td className="p-3">{project.endDate || "—"}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        onClick={() => removeLink(project)}
                        disabled={saving}
                        className={`${actionBtnCls} border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50`}
                      >
                        فك الارتباط
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}