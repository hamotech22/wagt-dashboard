/* eslint-disable react-refresh/only-export-components */

const STATUS = {
  active: { label: "نشطة", cls: "bg-green-100 text-green-700" },
  inactive: { label: "غير نشطة", cls: "bg-gray-200 text-gray-600" },
  maintenance: { label: "صيانة", cls: "bg-yellow-100 text-yellow-700" },
  online: { label: "نشطة", cls: "bg-green-100 text-green-700" },
  offline: { label: "غير نشطة", cls: "bg-gray-200 text-gray-600" },
  online: { label: "نشطة", cls: "bg-green-100 text-green-700" },
  offline: { label: "غير نشطة", cls: "bg-gray-200 text-gray-600" },
};

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.inactive;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

export function ConnectionBadge({ status }) {
  const online = status === "online" || status === "متصل" || status === "متصلة";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`w-2 h-2 rounded-full ${online ? "bg-green-500" : "bg-red-500"}`} />
      <span className={online ? "text-green-700" : "text-red-600"}>
        {online ? "متصلة" : "غير متصلة"}
      </span>
    </span>
  );
}

export const DIRECTION_LABEL = { in: "دخول", out: "خروج", both: "دخول وخروج" };
export const TYPE_LABEL = { weighbridge: "بوابة بميزان", standard: "بوابة عادية" };
export const DEVICE_LABEL = {
  anpr: "كاميرا ANPR", camera: "كاميرا", scale: "ميزان",
  controller: "متحكم", sensor: "حساس", access: "جهاز تحكم دخول",
};

export const formatDate = (d) =>
  d ? new Date(d).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" }) : "-";
