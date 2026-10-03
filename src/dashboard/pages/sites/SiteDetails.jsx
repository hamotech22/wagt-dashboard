import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const API_URL = "http://localhost:3000";

const fetchSite = (id) =>
  axios
    .get(`${API_URL}/sites/${id}`)
    .then((response) => response.data)
    .catch(() => null);
const fetchLookups = () =>
  axios
    .all([axios.get(`${API_URL}/projects`), axios.get(`${API_URL}/wasteTypesRef`)])
    .then(([projectsRes, wasteTypesRes]) => ({
      projects: projectsRes?.data ?? [],
      wasteTypes: wasteTypesRes?.data ?? [],
    }))
    .catch(() => ({ projects: [], finalDestinations: [], wasteTypes: [] }));

function Item({ label, children }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-sm text-gray-800">{children || "-"}</div>
    </div>
  );
}

export default function SiteDetails() {
  const { id } = useParams();
  const [site, setSite] = useState(null);
  const [lookups, setLookups] = useState({ projects: [], wasteTypes: [] });
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    Promise.all([fetchSite(id), fetchLookups()]).then(([s, l]) => {
      setSite(s);
      setLookups(l);
      setLoadError(!s);
    });
  }, [id]);

  if (!site && !loadError) return <div className="p-6 text-gray-400">جارِ التحميل...</div>;
  if (loadError) return <div className="p-6 text-red-600">تعذّر تحميل بيانات الموقع. تحقق من تشغيل json-server ثم أعد المحاولة.</div>;

  const currentCapacity = Number(site.currentCapacity) || 0;
  const totalCapacity = Number(site.totalCapacity) || 0;
  const pct = totalCapacity ? Math.min(100, Math.round((currentCapacity / totalCapacity) * 100)) : 0;
  const project = lookups.projects.find((p) => p.id === site.projectId)?.name;
  const wasteTypeCodes = Array.isArray(site.wasteTypeCodes) ? site.wasteTypeCodes : [];

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{site.nameAr || site.name || "موقع بدون اسم"}</h1>
          <p className="text-sm text-gray-400" dir="ltr">
            {site.nameEn || ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/dashboard/sites/edit/${site.id}`} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
            تعديل
          </Link>
          <Link to="/dashboard/sites" className="border px-4 py-2 rounded-lg text-sm">
            رجوع
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* معلومات */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5 grid grid-cols-2 gap-5">
          <Item label="الحالة">
            <StatusBadge status={site.status} />
          </Item>
          <Item label="المشروع">{project}</Item>
          <Item label="كود نقطة التخلص">
            <span className="font-mono" dir="ltr">
              {site.finalDestinationCode}
            </span>
          </Item>
          <Item label="عدد البوابات">{site.gatesCount}</Item>
          <Item label="أنواع النفايات">
            <div className="flex flex-wrap gap-1">
              {wasteTypeCodes.length
                ? wasteTypeCodes.map((c) => (
                    <span key={c} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                      {lookups.wasteTypes.find((w) => w.code === c)?.name || c}
                    </span>
                  ))
                : "-"}
            </div>
          </Item>
          <Item label="الإحداثيات">
            <span dir="ltr">
              {site.lat != null && site.lng != null && site.lat !== "" && site.lng !== ""
                ? `${site.lat}, ${site.lng}`
                : "-"}
            </span>
            {site.demoCoordinates && <span className="mr-2 text-xs text-amber-600">تجريبية</span>}
          </Item>
          <div className="col-span-2">
            <Item label="ملاحظات">{site.notes}</Item>
          </div>
        </div>

        {/* السعة */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">السعة</h3>
          <div className="text-3xl font-bold text-gray-800">{pct}%</div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden my-3">
            <div
              className={`h-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-green-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-sm text-gray-500">
            {currentCapacity.toLocaleString()} / {totalCapacity.toLocaleString()} طن
          </div>
        </div>
      </div>

      {/* البوابات — مكان جاهز للربط لاحقاً */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-2">البوابات التابعة للموقع</h3>
        <p className="text-sm text-gray-400">سيتم عرض بوابات هذا الموقع هنا عند إكمال صفحة البوابات.</p>
      </div>
    </div>
  );
}
