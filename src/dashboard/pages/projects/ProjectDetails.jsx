import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

const statuses = {
  active: { label: "نشط", style: "bg-emerald-100 text-emerald-700" },
  pending: { label: "قيد التنفيذ", style: "bg-amber-100 text-amber-700" },
  completed: { label: "مكتمل", style: "bg-blue-100 text-blue-700" },
};

const syncStatuses = {
  synced: { label: "تمت المزامنة", style: "bg-emerald-100 text-emerald-700" },
  pending: { label: "قيد الانتظار", style: "bg-amber-100 text-amber-700" },
  failed: { label: "فشل", style: "bg-red-100 text-red-700" },
};

const tabs = [
  { key: "overview", label: "نظرة عامة" },
  { key: "sites", label: "المواقع" },
  { key: "transactions", label: "العمليات" },
];

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [sites, setSites] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");

  // جلب بيانات المشروع (تُستخدم عند فتح الصفحة وعند إعادة المحاولة)
  const loadData = () => {
    setLoading(true);
    setError("");

    Promise.all([
      axios.get(`${API_URL}/projects/${id}`),
      axios.get(`${API_URL}/sites?projectId=${id}`),
      axios.get(`${API_URL}/transactions?projectId=${id}`),
      axios.get(`${API_URL}/municipalities`),
      axios.get(`${API_URL}/contractors`),
    ])
      .then(([projectRes, sitesRes, transactionsRes, municipalitiesRes, contractorsRes]) => {
        setProject(projectRes.data);
        setSites(sitesRes.data);
        setTransactions(transactionsRes.data);
        setMunicipalities(municipalitiesRes.data);
        setContractors(contractorsRes.data);
      })
      .catch((err) => setError(err.message || "تعذّر تحميل بيانات المشروع"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // حالة التحميل
  if (loading) {
    return (
      <div dir="rtl" className="animate-pulse space-y-4 p-6" aria-busy="true" aria-label="جارٍ التحميل">
        <div className="h-8 w-64 rounded-lg bg-gray-100" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-24 rounded-xl bg-gray-100" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-gray-100" />
      </div>
    );
  }

  // حالة الخطأ
  if (error) {
    return (
      <div dir="rtl" className="flex flex-col items-center gap-3 p-16 text-center">
        <p className="font-medium text-gray-800">تعذّر فتح المشروع</p>
        <p className="text-sm text-gray-500">{error}</p>
        <div className="flex gap-2">
          <button onClick={loadData} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
            إعادة المحاولة
          </button>
          <button
            onClick={() => navigate("/dashboard/projects")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            العودة للمشاريع
          </button>
        </div>
      </div>
    );
  }

  // بيانات محسوبة
  const totalWeight = transactions.reduce((sum, t) => sum + Number(t.weight), 0);
  const unsentCount = transactions.filter((t) => t.syncStatus !== "synced").length;

  const municipalityName = municipalities.find((m) => String(m.id) === String(project.municipalityId))?.name;

  const contractorNames = (project.contractorIds || [])
    .map((cid) => contractors.find((c) => String(c.id) === String(cid))?.name)
    .filter(Boolean)
    .join("، ");

  const info = [
    ["اسم المشروع", project.name],
    ["الكود", project.code],
    ["رقم العقد", project.contractNumber],
    ["البلدية", municipalityName || "—"],
    ["المقاول", contractorNames || "—"],
    ["تاريخ البداية", project.startDate ? new Date(project.startDate).toLocaleDateString("en-GB") : "—"],
    ["الميزانية", project.budget ? `${Number(project.budget).toLocaleString("en-US")} ر.س` : "—"],
  ];

  const cards = [
    ["عدد المواقع", sites.length, "bg-violet-50 text-violet-700"],
    ["عدد العمليات", transactions.length, "bg-emerald-50 text-emerald-700"],
    ["إجمالي الوزن (طن)", totalWeight.toFixed(1), "bg-blue-50 text-blue-700"],
    ["عمليات لم تُرسل لمدينتي", unsentCount, "bg-amber-50 text-amber-700"],
  ];

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/projects">المشاريع</Breadcrumb.Link>
        <Breadcrumb.Current>{project.name}</Breadcrumb.Current>
      </Breadcrumb>

      {/* الرأس */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statuses[project.status]?.style}`}>
            {statuses[project.status]?.label ?? project.status}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          {project.code} – عقد رقم {project.contractNumber}
        </p>
      </div>

      {/* البطاقات */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([label, value, color]) => (
          <div key={label} className={`rounded-xl shadow-sm p-4 ${color}`}>
            <p className="text-sm">{label}</p>
            <p className="mt-3 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <section className="bg-white rounded-xl shadow-sm">
        {/* التبويبات */}
        <div className="flex gap-1 border-b px-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium ${
                tab === t.key ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* نظرة عامة */}
        {tab === "overview" && (
          <div className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {info.map(([label, value]) => (
              <div key={label}>
                <div className="text-xs text-gray-400 mb-1">{label}</div>
                <div className="text-sm text-gray-800">{value || "-"}</div>
              </div>
            ))}
          </div>
        )}

        {/* المواقع */}
        {tab === "sites" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3">الموقع</th>
                  <th className="p-3">كود نقطة التخلص</th>
                  <th className="p-3">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {sites.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-400">
                      لا توجد مواقع مرتبطة بهذا المشروع بعد.
                    </td>
                  </tr>
                )}

                {sites.map((s) => (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{s.name}</td>
                    <td className="p-3 font-mono text-xs" dir="ltr">
                      {s.finalDestinationCode}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          s.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
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
            <table className="w-full text-sm text-right">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3">رقم اللوحة</th>
                  <th className="p-3">نوع النفايات</th>
                  <th className="p-3">الوزن (طن)</th>
                  <th className="p-3">الوقت</th>
                  <th className="p-3">الإرسال لمدينتي</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      لا توجد عمليات مسجلة لهذا المشروع بعد.
                    </td>
                  </tr>
                )}

                {transactions.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800" dir="ltr">
                      {t.plate}
                    </td>
                    <td className="p-3">{t.wasteType}</td>
                    <td className="p-3">{t.weight}</td>
                    <td className="p-3 text-xs" dir="ltr">
                      {t.time}
                    </td>
                    <td className="p-3">
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