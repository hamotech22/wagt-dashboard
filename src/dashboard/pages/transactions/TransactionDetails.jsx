import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge, PlateBadge, txCode, tons, formatDate } from "./TransactionBadges";
import Breadcrumb from "../../components/common/Breadcrumb";

const API_URL = "http://localhost:3000";

const btnCls = "border px-4 py-2 rounded-lg text-sm hover:bg-gray-50";

function Item({ label, children }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-sm text-gray-800">{children || "-"}</div>
    </div>
  );
}

function WeightCard({ label, value, color = "text-gray-800" }) {
  return (
    <div className="text-center flex-1">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{tons(value)}</div>
      <div className="text-xs text-gray-400">طن</div>
    </div>
  );
}

function ImageSlot({ label, src }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-2">{label}</div>
      {src ? (
        <img src={src} alt={label} className="w-full h-40 object-cover rounded-lg border" />
      ) : (
        <div className="w-full h-40 rounded-lg border border-dashed bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
          لا توجد صورة
        </div>
      )}
    </div>
  );
}

function Timeline({ tx }) {
  const steps = [
    { label: "تسجيل الدخول", time: tx.entryAt, done: !!tx.entryAt },
    { label: "داخل الموقع", time: null, done: !!tx.entryAt && tx.status !== "rejected" },
    { label: "تسجيل الخروج", time: tx.exitAt, done: !!tx.exitAt },
    { label: "اكتمال العملية", time: tx.status === "completed" ? tx.exitAt : null, done: tx.status === "completed" },
  ];

  return (
    <ol className="space-y-4">
      {steps.map((s) => (
        <li key={s.label} className="flex items-start gap-3">
          <span
            className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${
              s.done ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            {s.done ? "✓" : ""}
          </span>
          <div>
            <div className={`text-sm ${s.done ? "text-gray-800" : "text-gray-400"}`}>{s.label}</div>
            {s.time && <div className="text-xs text-gray-400">{formatDate(s.time)}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function TransactionDetails() {
  const { id } = useParams();
  const [tx, setTx] = useState(null);
  const [sites, setSites] = useState([]);
  const [gates, setGates] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);

  // جلب بيانات العملية والقوائم المرتبطة بها
  const loadData = () => {
    Promise.all([
      axios.get(`${API_URL}/transactions/${id}`),
      axios.get(`${API_URL}/sites`),
      axios.get(`${API_URL}/gates`),
      axios.get(`${API_URL}/contractors`),
      axios.get(`${API_URL}/projects`),
      axios.get(`${API_URL}/wasteTypesRef`),
    ])
      .then(([txRes, sitesRes, gatesRes, contractorsRes, projectsRes, wasteRes]) => {
        setTx(txRes.data);
        setSites(sitesRes.data);
        setGates(gatesRes.data);
        setContractors(contractorsRes.data);
        setProjects(projectsRes.data);
        setWasteTypes(wasteRes.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // إلغاء العملية (يفضّل حصرها بصلاحية transactions.cancel)
  const handleCancel = async () => {
    const reason = window.prompt("سبب إلغاء العملية (إلزامي):");
    if (!reason || !reason.trim()) return;
    await axios.patch(`${API_URL}/transactions/${id}`, { status: "cancelled", note: reason.trim() });
    loadData();
  };

  // اسم عنصر من قائمة
  const getName = (list, value, key = "id") => list.find((x) => String(x[key]) === String(value))?.name;

  if (!tx) return <div className="p-6 text-gray-400">جارِ التحميل...</div>;

  const showNote = tx.note && (tx.status === "rejected" || tx.status === "cancelled");

  return (
    <div dir="rtl" className="p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Link to="/dashboard/transactions">المعاملات</Breadcrumb.Link>
        <Breadcrumb.Current>تفاصيل المعاملة</Breadcrumb.Current>
      </Breadcrumb>

      {/* الرأس */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <PlateBadge number={tx.plateNumber} chars={tx.plateChars} size="lg" />
          <div>
            <div className="font-mono text-sm text-gray-500" dir="ltr">
              {txCode(tx.id)}
            </div>
            <StatusBadge status={tx.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tx.status === "inside" && (
            <button
              onClick={handleCancel}
              className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-lg text-sm"
            >
              إلغاء العملية
            </button>
          )}
          <Link to="/dashboard/transactions" className={btnCls}>
            رجوع
          </Link>
        </div>
      </div>

      {/* سبب الرفض / الإلغاء */}
      {showNote && (
        <div
          className={`text-sm rounded-lg p-3 border ${
            tx.status === "rejected" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-700"
          }`}
        >
          <b>{tx.status === "rejected" ? "سبب الرفض: " : "سبب الإلغاء: "}</b>
          {tx.note}
        </div>
      )}

      {/* الأوزان */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-4">الأوزان</h3>
        <div className="flex items-center divide-x divide-x-reverse divide-gray-200">
          <WeightCard label="وزن الدخول (محمّلة)" value={tx.inWeight} />
          <WeightCard label="وزن الخروج (فارغة)" value={tx.outWeight} />
          <WeightCard label="صافي النفايات" value={tx.wasteWeight} color="text-green-600" />
        </div>
        {tx.status === "inside" && <p className="text-xs text-gray-400 mt-4 text-center">سيُحسب صافي النفايات عند تسجيل وزن الخروج.</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* بيانات العملية */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5 grid grid-cols-2 gap-5">
          <h3 className="col-span-2 font-semibold text-gray-800">بيانات العملية</h3>
          <Item label="المقاول">{getName(contractors, tx.contractorId)}</Item>
          <Item label="المشروع">{getName(projects, tx.projectId)}</Item>
          <Item label="الموقع">{getName(sites, tx.siteId)}</Item>
          <Item label="نوع النفايات">{getName(wasteTypes, tx.wasteTypeCode, "code")}</Item>
          <Item label="بوابة الدخول">{getName(gates, tx.entryGateId)}</Item>
          <Item label="بوابة الخروج">{getName(gates, tx.exitGateId)}</Item>
          <Item label="اسم السائق">{tx.driverName}</Item>
          <Item label="وقت الدخول">{formatDate(tx.entryAt)}</Item>
          <Item label="وقت الخروج">{formatDate(tx.exitAt)}</Item>
        </div>

        {/* مسار العملية */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">مسار العملية</h3>
          <Timeline tx={tx} />
        </div>
      </div>

      {/* الصور */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-4">الصور</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ImageSlot label="صورة اللوحة" src={tx.images?.plate} />
          <ImageSlot label="صورة الدخول" src={tx.images?.entry} />
          <ImageSlot label="صورة الخروج" src={tx.images?.exit} />
        </div>
      </div>
    </div>
  );
}
