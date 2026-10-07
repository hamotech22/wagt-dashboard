/* eslint-disable react-refresh/only-export-components */

const STATUS = {
  inside: { label: "داخل الموقع", cls: "bg-blue-100 text-blue-700" },
  completed: { label: "مكتملة", cls: "bg-green-100 text-green-700" },
  rejected: { label: "مرفوضة", cls: "bg-red-100 text-red-700" },
  cancelled: { label: "ملغاة", cls: "bg-gray-200 text-gray-600" },
};

export const STATUS_OPTIONS = Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }));

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.cancelled;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

export function PlateBadge({ number, chars, size = "md" }) {
  const big = size === "lg";
  return (
    <span
      dir="ltr"
      className={`inline-flex items-center border-2 border-gray-800 rounded-md bg-white font-bold tracking-widest text-gray-900 ${
        big ? "px-4 py-2 text-2xl gap-3" : "px-2 py-0.5 text-sm gap-2"
      }`}
    >
      <span>{number}</span>
      <span className="w-px self-stretch bg-gray-400" />
      <span dir="rtl">{chars}</span>
    </span>
  );
}

export const txCode = (id) => `TX-${String(id).padStart(6, "0")}`;

export function getTransactionPlate(transaction, vehicles = []) {
  const vehicle = vehicles.find((item) => String(item.id) === String(transaction.vehicleId));

  return {
    number: transaction.plateNumber ?? transaction.vehicle?.plateNumber ?? transaction.vehicle?.num ?? vehicle?.plateNumber,
    chars: transaction.plateChars ?? transaction.vehicle?.plateChars ?? transaction.vehicle?.chars ?? vehicle?.plateChars,
  };
}

export function getWasteWeight(transaction) {
  if (transaction.wasteWeight != null) return Number(transaction.wasteWeight);
  if (transaction.inWeight == null || transaction.outWeight == null) return null;

  const netWeight = Number(transaction.inWeight) - Number(transaction.outWeight);
  return Number.isFinite(netWeight) && netWeight >= 0 ? netWeight : null;
}

// الأوزان بالكيلوجرام → طن
export const tons = (kg) => (kg == null ? "-" : (kg / 1000).toFixed(2));

export const formatDate = (d) =>
  d ? new Date(d).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" }) : "-";

export const isToday = (d) => d && new Date(d).toDateString() === new Date().toDateString();
