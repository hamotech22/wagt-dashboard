import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:3000";

const statuses = {
  active: { label: "نشطة", style: "bg-emerald-100 text-emerald-700" },
  inactive: { label: "غير نشطة", style: "bg-amber-100 text-amber-700" },
};

const projectStatuses = {
  active: { label: "نشط", style: "bg-emerald-100 text-emerald-700" },
  pending: { label: "قيد التنفيذ", style: "bg-amber-100 text-amber-700" },
  completed: { label: "مكتمل", style: "bg-sky-100 text-sky-700" },
};

const organizationsApi = {
  get: (id) => axios.get(`${API_URL}/organizations/${id}`).then((response) => response.data),
  subMunicipalities: (organizationId) =>
    axios.get(`${API_URL}/subMunicipalities?organizationId=${organizationId}`).then((response) => response.data),
  projects: (organizationId) => axios.get(`${API_URL}/projects?municipalityId=${organizationId}`).then((response) => response.data),
};

const tabs = [
  { key: "overview", label: "نظرة عامة" },
  { key: "subs", label: "البلديات الفرعية" },
  { key: "projects", label: "المشاريع" },
];

export default function OrganizationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // state
  const [organization, setOrganization] = useState(null);
  const [subs, setSubs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState("overview");

  // API: تحميل بيانات الجهة (يُعاد عند تغيّر id أو الضغط على إعادة المحاولة)
  useEffect(() => {
    setLoading(true);
    setError("");

    Promise.all([organizationsApi.get(id), organizationsApi.subMunicipalities(id), organizationsApi.projects(id)])
      .then(([orgData, subsData, projectsData]) => {
        setOrganization(orgData);
        setSubs(subsData);
        setProjects(projectsData);
      })
      .catch((err) => setError(err.message || "تعذّر تحميل بيانات الجهة"))
      .finally(() => setLoading(false));
  }, [id, reloadKey]);

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
        <p className="font-medium text-slate-800">تعذّر فتح الجهة</p>
        <p className="text-sm text-slate-500">{error}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReloadKey(reloadKey + 1)}
            className="h-10 rounded-lg border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-50"
          >
            إعادة المحاولة
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/organizations")}
            className="h-10 rounded-lg bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-500"
          >
            العودة للجهات
          </button>
        </div>
      </div>
    );
  }

  // بيانات مشتقة
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;

  const info = [
    ["اسم الجهة", organization.name],
    ["النطاق الفرعي", organization.slug ? `/${organization.slug}` : "—"],
    ["الرمز", organization.code],
    ["كود البلدية في مدينتي", organization.municipalityCode || "—"],
    ["البريد الإلكتروني", organization.email || "—"],
    ["رقم الهاتف", organization.phone || "—"],
    ["الموقع الإلكتروني", organization.website || "—"],
    ["المدينة", organization.city || "—"],
    ["المنطقة", organization.region || "—"],
    ["تاريخ الإضافة", organization.createdAt ? new Date(organization.createdAt).toLocaleDateString("en-GB") : "—"],
  ];
  // القيم التي تُعرض من اليسار إلى اليمين
  const ltrLabels = ["النطاق الفرعي", "الرمز", "كود البلدية في مدينتي", "البريد الإلكتروني", "رقم الهاتف", "الموقع الإلكتروني"];

  const cards = [
    ["البلديات الفرعية", subs.length, "bg-sky-50 text-sky-700"],
    ["عدد المشاريع", projects.length, "bg-emerald-50 text-emerald-700"],
    ["مشاريع نشطة", activeProjects, "bg-blue-50 text-blue-700"],
    ["مشاريع مكتملة", completedProjects, "bg-amber-50 text-amber-700"],
  ];

  return (
    <div className="space-y-6 p-6">
      {/* الرأس */}
      <div>
        <nav aria-label="مسار التنقل" className="mb-2 flex items-center gap-2 text-sm text-slate-500">
          <button type="button" onClick={() => navigate("/dashboard/organizations")} className="hover:text-sky-600">
            الجهات والبلديات
          </button>
          <span aria-hidden="true">/</span>
          <span className="text-slate-800">{organization.name}</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{organization.name}</h1>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statuses[organization.status]?.style}`}>
                {statuses[organization.status]?.label ?? organization.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {organization.code} – {organization.region || organization.city}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/dashboard/organizations/edit/${id}`)}
            className="h-10 rounded-lg bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-500"
          >
            تعديل
          </button>
        </div>
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
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {ltrLabels.includes(label) && value !== "—" ? (
                    <span dir="ltr" className="inline-block">
                      {value}
                    </span>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-xs text-slate-500">العنوان التفصيلي</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">{organization.address || "—"}</dd>
            </div>
          </dl>
        )}

        {/* البلديات الفرعية */}
        {tab === "subs" && (
          <div className="overflow-x-auto">
            <p className="border-b border-slate-100 px-4 py-3 text-xs text-slate-500">بيانات مرجعية للقراءة فقط، تُجلب من منصة مدينتي.</p>
            <table className="min-w-full text-right">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">البلدية الفرعية</th>
                  <th className="px-4 py-3 font-medium">الكود</th>
                  <th className="px-4 py-3 font-medium">مرتبطة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {subs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                      لا توجد بلديات فرعية لهذه الجهة بعد.
                    </td>
                  </tr>
                )}
                {subs.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{s.arabicName}</td>
                    <td className="px-4 py-3">
                      <span dir="ltr" className="inline-block">
                        {s.code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          s.isRelatedSubMunicipality ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {s.isRelatedSubMunicipality ? "نعم" : "لا"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* المشاريع */}
        {tab === "projects" && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">المشروع</th>
                  <th className="px-4 py-3 font-medium">الكود</th>
                  <th className="px-4 py-3 font-medium">المقاول</th>
                  <th className="px-4 py-3 font-medium">الحالة</th>
                  <th className="px-4 py-3 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      لا توجد مشاريع مرتبطة بهذه الجهة بعد.
                    </td>
                  </tr>
                )}
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-4 py-3">{p.code}</td>
                    <td className="px-4 py-3">{p.contractor}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${projectStatuses[p.status]?.style}`}>
                        {projectStatuses[p.status]?.label ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/projects/${p.id}`)}
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                      >
                        عرض
                      </button>
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
