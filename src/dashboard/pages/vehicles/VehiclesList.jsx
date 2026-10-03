import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import { StatusBadge, SourceBadge, PlateBadge } from "./VehicleBadges";
import { VEHICLE_TYPES } from "./vehicleTypes";

const API_URL = "http://localhost:3000";

const selectCls = "border rounded-lg px-3 py-2 text-sm";
const actionBtnCls = "rounded-md border px-2.5 py-1";

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
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [contractorId, setContractorId] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  // جلب البيانات من السيرفر
  const loadData = () => {
    setLoading(true);
    Promise.all([axios.get(`${API_URL}/vehicles`), axios.get(`${API_URL}/contractors`)])
      .then(([vehiclesRes, contractorsRes]) => {
        setVehicles(vehiclesRes.data);
        setContractors(contractorsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // حذف مركبة
  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المركبة؟")) return;
    await axios.delete(`${API_URL}/vehicles/${id}`);
    loadData();
  };

  // اعتماد مركبة (PATCH يعدّل الحالة فقط ويحافظ على باقي البيانات)
  const handleApprove = async (id) => {
    await axios.patch(`${API_URL}/vehicles/${id}`, { status: "active" });
    loadData();
  };

  // اسم المقاول من رقمه
  const getContractorName = (id) => contractors.find((c) => String(c.id) === String(id))?.name || "-";

  // اسم النوع من قيمته
  const getTypeName = (value) => VEHICLE_TYPES.find((t) => t.value === value)?.label || value;

  // الفلترة
  const plateSearch = search.replace(/\s/g, "");
  const filtered = vehicles.filter(
    (v) =>
      ((v.plateNumber || "") + (v.plateChars || "").replace(/\s/g, "")).includes(plateSearch) &&
      (!contractorId || String(v.contractorId) === contractorId) &&
      (!type || v.type === type) &&
      (!status || v.status === status),
  );

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Current>المركبات</Breadcrumb.Current>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المركبات</h1>
          <p className="text-sm text-gray-500">سجل المركبات المرتبطة بالمقاولين والمشاريع</p>
        </div>
        <Link to="/dashboard/vehicles/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + إضافة مركبة
        </Link>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="إجمالي المركبات" value={vehicles.length} color="text-gray-800" />
        <StatCard label="نشطة" value={vehicles.filter((v) => v.status === "active").length} color="text-green-600" />
        <StatCard label="بانتظار المراجعة" value={vehicles.filter((v) => v.status === "pending").length} color="text-orange-600" />
        <StatCard label="موقوفة" value={vehicles.filter((v) => v.status === "suspended").length} color="text-red-600" />
      </div>

      {/* الفلاتر */}
      <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث برقم اللوحة أو حروفها..."
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select value={contractorId} onChange={(e) => setContractorId(e.target.value)} className={selectCls}>
          <option value="">كل المقاولين</option>
          {contractors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
          <option value="">كل الأنواع</option>
          {VEHICLE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
          <option value="">كل الحالات</option>
          <option value="active">نشطة</option>
          <option value="pending">بانتظار المراجعة</option>
          <option value="suspended">موقوفة</option>
          <option value="inactive">غير نشطة</option>
        </select>
      </div>

      {/* الجدول */}
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
                <td className="p-3">{getTypeName(v.type)}</td>
                <td className="p-3">
                  {v.contractorId ? getContractorName(v.contractorId) : <span className="text-orange-600 text-xs">غير مرتبطة</span>}
                </td>
                <td className="p-3">
                  <SourceBadge source={v.source} />
                </td>
                <td className="p-3">
                  <StatusBadge status={v.status} />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2 text-xs">
                    {v.status === "pending" && (
                      <button
                        onClick={() => handleApprove(v.id)}
                        className={`${actionBtnCls} border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100`}
                      >
                        اعتماد
                      </button>
                    )}
                    <Link to={`/dashboard/vehicles/${v.id}`} className={`${actionBtnCls} border-gray-200 text-gray-700 hover:bg-gray-50`}>
                      عرض
                    </Link>
                    <Link
                      to={`/dashboard/vehicles/edit/${v.id}`}
                      className={`${actionBtnCls} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
                    >
                      {v.status === "pending" ? "ربط" : "تعديل"}
                    </Link>
                    <button
                      onClick={() => handleDelete(v.id)}
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
      </div>
    </div>
  );
}
