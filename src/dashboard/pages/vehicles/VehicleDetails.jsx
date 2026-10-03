import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge, SourceBadge, PlateBadge, TX_STATUS, formatDate } from "./VehicleBadges";
import { VEHICLE_TYPES } from "./vehicleTypes";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

const fetchVehicle = (id) =>
  axios
    .get(`${API_URL}/vehicles/${id}`)
    .then((response) => response.data)
    .catch(() => null);
const fetchVehicleLookups = () =>
  axios
    .all([axios.get(`${API_URL}/contractors`), axios.get(`${API_URL}/projects`)])
    .then(([contractorsRes, projectsRes]) => ({
      types: VEHICLE_TYPES,
      contractors: contractorsRes?.data ?? [],
      projects: projectsRes?.data ?? [],
    }))
    .catch(() => ({ types: VEHICLE_TYPES, contractors: [], projects: [] }));
const fetchVehicleTransactions = (id) =>
  axios
    .get(`${API_URL}/transactions`, { params: { vehicleId: Number(id) } })
    .then((response) => response.data)
    .catch(() => []);

function Item({ label, children }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-sm text-gray-800">{children || "-"}</div>
    </div>
  );
}

export default function VehicleDetails() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [lookups, setLookups] = useState({ types: [], contractors: [], projects: [] });
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    Promise.all([fetchVehicle(id), fetchVehicleLookups(), fetchVehicleTransactions(id)]).then(([v, l, t]) => {
      setVehicle(v);
      setLookups(l);
      setTxs(t);
    });
  }, [id]);

  if (!vehicle) return <div className="p-6 text-gray-400">جارِ التحميل...</div>;

  const type = lookups.types.find((t) => t.value === vehicle.type)?.label;
  const contractor = lookups.contractors.find((c) => String(c.id) === String(vehicle.contractorId))?.name;
  const project = lookups.projects.find((p) => String(p.id) === String(vehicle.projectId))?.name;

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/vehicles">المركبات</Breadcrumb.Link>
        <Breadcrumb.Current>تفاصيل المركبة</Breadcrumb.Current>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <PlateBadge number={vehicle.plateNumber} chars={vehicle.plateChars} size="lg" />
          <StatusBadge status={vehicle.status} />
        </div>
        <div className="flex gap-2">
          <Link to={`/dashboard/vehicles/edit/${vehicle.id}`} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
            تعديل
          </Link>
          <Link to="/dashboard/vehicles" className="border px-4 py-2 rounded-lg text-sm">
            رجوع
          </Link>
        </div>
      </div>

      {vehicle.status === "pending" && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 text-sm rounded-lg p-3">
          هذه المركبة اكتُشفت تلقائياً بواسطة ANPR وغير مرتبطة بمقاول. اربطها بمقاول ومشروع ثم اعتمدها.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5 grid grid-cols-2 gap-5">
          <h3 className="col-span-2 font-semibold text-gray-800">بيانات المركبة</h3>
          <Item label="نوع المركبة">{type}</Item>
          <Item label="مصدر البيانات">
            <SourceBadge source={vehicle.source} />
          </Item>
          <Item label="المقاول">{contractor}</Item>
          <Item label="المشروع">{project}</Item>
          <Item label="تاريخ الإنشاء">{formatDate(vehicle.createdAt)}</Item>
          <Item label="آخر تحديث">{formatDate(vehicle.updatedAt)}</Item>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">آخر العمليات</h3>
          {txs.length === 0 ? (
            <p className="text-sm text-gray-400">لا توجد عمليات لهذه المركبة.</p>
          ) : (
            <table className="w-full text-sm text-right">
              <thead className="text-gray-500 text-xs">
                <tr>
                  <th className="pb-2">التاريخ</th>
                  <th className="pb-2">النفايات</th>
                  <th className="pb-2">الوزن (طن)</th>
                  <th className="pb-2">التكامل</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((t) => {
                  const statusMeta = TX_STATUS[t.status] || { label: "غير معروف", cls: "bg-gray-100 text-gray-600" };
                  return (
                    <tr key={t.id} className="border-t">
                      <td className="py-2">
                        <Link to={`/dashboard/transactions/${t.id}`} className="text-blue-600 hover:underline">
                          {formatDate(t.date)}
                        </Link>
                      </td>
                      <td className="py-2">{t.waste || "-"}</td>
                      <td className="py-2">{t.weight ?? "-"}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusMeta.cls}`}>{statusMeta.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
