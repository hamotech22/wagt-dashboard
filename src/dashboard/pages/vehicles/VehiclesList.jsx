import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge, SourceBadge, PlateBadge } from "./VehicleBadges";
import { VEHICLE_TYPES } from "./vehicleTypes";

const API_URL = "http://localhost:3000";

const fetchVehicles = () =>
  axios
    .get(`${API_URL}/vehicles`)
    .then((response) => response.data)
    .catch(() => []);
const fetchVehicleLookups = () =>
  axios
    .all([axios.get(`${API_URL}/contractors`), axios.get(`${API_URL}/projects`)])
    .then(([contractorsRes, projectsRes]) => ({
      types: VEHICLE_TYPES,
      contractors: contractorsRes?.data ?? [],
      projects: projectsRes?.data ?? [],
    }))
    .catch(() => ({ types: VEHICLE_TYPES, contractors: [], projects: [] }));
const deleteVehicle = (id) => axios.delete(`${API_URL}/vehicles/${id}`).then((response) => response.data);
const updateVehicle = (id, payload) => axios.put(`${API_URL}/vehicles/${id}`, { ...payload, id }).then((response) => response.data);

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

export default function VehiclesList() {
  const [vehicles, setVehicles] = useState([]);
  const [lookups, setLookups] = useState({ types: [], contractors: [], projects: [] });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [contractorId, setContractorId] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => {
    const [v, l] = await Promise.all([fetchVehicles(), fetchVehicleLookups()]);
    setVehicles(v);
    setLookups(l);
    setLoading(false);
  };

  useEffect(() => {
    Promise.all([fetchVehicles(), fetchVehicleLookups()])
      .then(([vehicleData, lookups]) => {
        setVehicles(vehicleData);
        setLookups(lookups);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.replace(/\s/g, "");
    return vehicles.filter(
      (v) =>
        (!q || (v.plateNumber + v.plateChars.replace(/\s/g, "")).includes(q)) &&
        (!contractorId || String(v.contractorId) === contractorId) &&
        (!type || v.type === type) &&
        (!status || v.status === status),
    );
  }, [vehicles, search, contractorId, type, status]);

  const contractorName = (id) =>
    lookups.contractors.find((contractor) => String(contractor.id) === String(id))?.name || "-";
  const typeName = (t) => lookups.types.find((x) => x.value === t)?.label || t;

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المركبة؟")) return;
    await deleteVehicle(id);
    setLoading(true);
    load();
  };

  const handleApprove = async (id) => {
    await updateVehicle(id, { status: "active" });
    setLoading(true);
    load();
  };

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المركبات</h1>
          <p className="text-sm text-gray-500">سجل المركبات المرتبطة بالمقاولين والمشاريع</p>
        </div>
        <Link to="/dashboard/vehicles/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
          + إضافة مركبة
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="إجمالي المركبات" value={vehicles.length} color="text-gray-800" />
        <StatCard label="نشطة" value={vehicles.filter((v) => v.status === "active").length} color="text-green-600" />
        <StatCard label="بانتظار المراجعة" value={vehicles.filter((v) => v.status === "pending").length} color="text-orange-600" />
        <StatCard label="موقوفة" value={vehicles.filter((v) => v.status === "suspended").length} color="text-red-600" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث برقم اللوحة أو حروفها..."
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={contractorId} onChange={(e) => setContractorId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">كل المقاولين</option>
          {lookups.contractors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">كل الأنواع</option>
          {lookups.types.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">كل الحالات</option>
          <option value="active">نشطة</option>
          <option value="pending">بانتظار المراجعة</option>
          <option value="suspended">موقوفة</option>
          <option value="inactive">غير نشطة</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">اللوحة</th>
              <th className="p-3">النوع</th>
              <th className="p-3">المقاول</th>
              <th className="p-3">المصدر</th>
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
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  لا توجد مركبات
                </td>
              </tr>
            )}

            {filtered.map((v) => (
              <tr key={v.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <PlateBadge number={v.plateNumber} chars={v.plateChars} />
                </td>
                <td className="p-3">{typeName(v.type)}</td>
                <td className="p-3">
                  {v.contractorId ? contractorName(v.contractorId) : <span className="text-orange-600 text-xs">غير مرتبطة</span>}
                </td>
                <td className="p-3">
                  <SourceBadge source={v.source} />
                </td>
                <td className="p-3">
                  <StatusBadge status={v.status} />
                </td>
                <td className="p-3">
                  <div className="flex gap-3 text-xs">
                    {v.status === "pending" && (
                      <button onClick={() => handleApprove(v.id)} className="text-purple-600 hover:underline">
                        اعتماد
                      </button>
                    )}
                    <Link to={`/dashboard/vehicles/${v.id}`} className="text-blue-600 hover:underline">
                      عرض
                    </Link>
                    <Link to={`/dashboard/vehicles/edit/${v.id}`} className="text-green-600 hover:underline">
                      {v.status === "pending" ? "ربط" : "تعديل"}
                    </Link>
                    <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:underline">
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
