import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

const statuses = {
  active: { label: "نشط", style: "bg-emerald-100 text-emerald-700" },
  pending: { label: "قيد التنفيذ", style: "bg-amber-100 text-amber-700" },
  completed: { label: "مكتمل", style: "bg-sky-100 text-sky-700" },
};

const syncStatuses = {
  synced: { label: "تمت المزامنة", style: "bg-emerald-100 text-emerald-700" },
  pending: { label: "قيد الانتظار", style: "bg-amber-100 text-amber-700" },
  failed: { label: "فشل", style: "bg-red-100 text-red-700" },
};

const projectsApi = {
  get: (id) => axios.get(`${API_URL}/projects/${id}`).then((response) => response.data),
  sites: (projectId) => axios.get(`${API_URL}/sites?projectId=${projectId}`).then((response) => response.data),
  transactions: (projectId) => axios.get(`${API_URL}/transactions?projectId=${projectId}`).then((response) => response.data),
  lookups: () =>
    axios
      .all([axios.get(`${API_URL}/municipalities`), axios.get(`${API_URL}/contractors`)])
      .then(([municipalitiesRes, contractorsRes]) => ({ municipalities: municipalitiesRes.data, contractors: contractorsRes.data })),
};

const tabs = [
  { key: "overview", label: "نظرة عامة" },
  { key: "sites", label: "المواقع" },
  { key: "transactions", label: "العمليات" },
];

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // state
  const [project, setProject] = useState(null);
  const [sites, setSites] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState("overview");

  // API: تحميل بيانات المشروع (يُعاد عند تغيّر id أو الضغط على إعادة المحاولة)
  useEffect(() => {
    Promise.all([projectsApi.get(id), projectsApi.sites(id), projectsApi.transactions(id), projectsApi.lookups()])
      .then(([projectData, sitesData, transactionsData, lookups]) => {
        setProject(projectData);
        setSites(sitesData);
        setTransactions(transactionsData);
        setMunicipalities(lookups.municipalities);
        setContractors(lookups.contractors);
        setError("");
      })
      .catch((err) => setError(err.message || "تعذّر تحميل بيانات المشروع"))
      .finally(() => setLoading(false));
  }, [id, reloadKey]);

  const reload = () => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-6" aria-busy="true" aria-label="جارٍ التحميل">
        <div className="h-8 w-64 rounded-lg bg-slate-100" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-24 rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 p-16 text-center">
        <p className="font-medium text-slate-800">تعذّر فتح المشروع</p>
        <p className="text-sm text-slate-500">{error}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reload}
            className="h-10 rounded-lg border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-50"
          >
            إعادة المحاولة
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/projects")}
            className="h-10 rounded-lg bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-500"
          >
            العودة للمشاريع
          </button>
        </div>
      </div>
    );
  }

  // بيانات مشتقة
  const totalWeight = transactions.reduce((sum, t) => sum + t.weight, 0);
  const unsentCount = transactions.filter((t) => t.syncStatus !== "synced").length;
  const projectContractors = (
    Array.isArray(project.contractorIds)
      ? project.contractorIds
      : project.contractorId != null
        ? [project.contractorId]
        : []
  )
    .map((contractorId) => contractors.find((contractor) => String(contractor.id) === String(contractorId))?.name)
    .filter(Boolean)
    .join("، ");

  const info = [
    ["اسم المشروع", project.name],
    ["الكود", project.code],
    ["رقم العقد", project.contractNumber],
    ["البلدية", municipalities.find((m) => String(m.id) === String(project.municipalityId))?.name ?? "—"],
    ["المقاول", projectContractors || "—"],
    ["تاريخ البداية", project.startDate ? new Date(project.startDate).toLocaleDateString("en-GB") : "—"],
    ["الميزانية", project.budget ? `${Number(project.budget).toLocaleString("en-US")} ر.س` : "—"],
  ];

  const cards = [
    ["عدد المواقع", sites.length, "bg-sky-50 text-sky-700"],
    ["عدد العمليات", transactions.length, "bg-emerald-50 text-emerald-700"],
    ["إجمالي الوزن (طن)", totalWeight.toFixed(1), "bg-blue-50 text-blue-700"],
    ["عمليات لم تُرسل لمدينتي", unsentCount, "bg-amber-50 text-amber-700"],
  ];

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/projects">المشاريع</Breadcrumb.Link>
        <Breadcrumb.Current>{project.name}</Breadcrumb.Current>
      </Breadcrumb>
      {/* الرأس */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statuses[project.status]?.style}`}>
            {statuses[project.status]?.label ?? project.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {project.code} – عقد رقم {project.contractNumber}
        </p>
      </div>

      {/* البطاقات */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([label, value, tone]) => (
          <div key={label} className={`rounded-xl border border-slate-200 p-4 ${tone}`}>
            <p className="text-sm">{label}</p>
            <p className="mt-3 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70">
        {/* التبويبات */}
        <div role="tablist" className="flex gap-1 border-b border-slate-100 px-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium ${
                tab === t.key ? "border-sky-600 text-sky-700" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* نظرة عامة */}
        {tab === "overview" && (
          <dl className="grid gap-x-8 gap-y-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {info.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* المواقع */}
        {tab === "sites" && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">الموقع</th>
                  <th className="px-4 py-3 font-medium">كود نقطة التخلص</th>
                  <th className="px-4 py-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {sites.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                      لا توجد مواقع مرتبطة بهذا المشروع بعد.
                    </td>
                  </tr>
                )}
                {sites.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                    <td className="px-4 py-3">
                      <span dir="ltr" className="inline-block">
                        {s.finalDestinationCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          s.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {s.active ? "نشط" : "متوقف"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* العمليات */}
        {tab === "transactions" && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">رقم اللوحة</th>
                  <th className="px-4 py-3 font-medium">نوع النفايات</th>
                  <th className="px-4 py-3 font-medium">الوزن (طن)</th>
                  <th className="px-4 py-3 font-medium">الوقت</th>
                  <th className="px-4 py-3 font-medium">الإرسال لمدينتي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      لا توجد عمليات مسجلة لهذا المشروع بعد.
                    </td>
                  </tr>
                )}
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <span dir="ltr" className="inline-block">
                        {t.plate}
                      </span>
                    </td>
                    <td className="px-4 py-3">{t.wasteType}</td>
                    <td className="px-4 py-3">{t.weight}</td>
                    <td className="px-4 py-3">
                      <span dir="ltr" className="inline-block">
                        {t.time}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${syncStatuses[t.syncStatus]?.style}`}>
                        {syncStatuses[t.syncStatus]?.label ?? t.syncStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
