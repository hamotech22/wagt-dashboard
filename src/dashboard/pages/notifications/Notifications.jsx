import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../components/common/Breadcrumb";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:3000";

const TYPES = {
  device: { label: "جهاز", icon: "🔧" },
  gate: { label: "بوابة", icon: "🚪" },
  system: { label: "نظام", icon: "⚙️" },
};
const SEVERITY = {
  critical: { label: "حرج", badge: "bg-red-100 text-red-700", bar: "border-red-500" },
  warning: { label: "تحذير", badge: "bg-amber-100 text-amber-700", bar: "border-amber-500" },
  info: { label: "معلومة", badge: "bg-blue-100 text-blue-700", bar: "border-blue-500" },
};

const fetchNotifications = () =>
  axios
    .get(`${API_URL}/notifications`)
    .then((response) => (Array.isArray(response.data) ? response.data : []));
const markRead = (id) => axios.patch(`${API_URL}/notifications/${id}`, { read: true }).then((response) => response.data);
const markAllRead = async () => {
  const notifications = await fetchNotifications();
  await Promise.all(notifications.filter((notification) => !notification.read).map((notification) => markRead(notification.id)));
};
const resolveNotification = (id) => axios.patch(`${API_URL}/notifications/${id}`, { resolved: true }).then((response) => response.data);

const TABS = [
  { key: "all", label: "الكل" },
  { key: "unread", label: "غير مقروءة" },
  { key: "active", label: "نشطة" },
  { key: "resolved", label: "تمت المعالجة" },
];

function timeAgo(iso) {
  const min = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (min < 1) return "الآن";
  if (min < 60) return `قبل ${min} دقيقة`;
  const h = Math.floor(min / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  return `قبل ${Math.floor(h / 24)} يوم`;
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("active");
  const [type, setType] = useState("");
  const [severity, setSeverity] = useState("");

  useEffect(() => {
    let mounted = true;
    fetchNotifications().then((nextItems) => {
      if (!mounted) return;
      setItems(nextItems);
      setLoading(false);
    }).catch(() => {
      if (!mounted) return;
      setError("تعذّر تحميل التنبيهات. تحقق من تشغيل json-server ثم أعد المحاولة.");
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      active: items.filter((n) => !n.resolved).length,
      critical: items.filter((n) => !n.resolved && n.severity === "critical").length,
      unread: items.filter((n) => !n.read).length,
      resolved: items.filter((n) => n.resolved).length,
    }),
    [items],
  );

  const filtered = useMemo(
    () =>
      items.filter(
        (n) =>
          (tab === "all" || (tab === "unread" && !n.read) || (tab === "active" && !n.resolved) || (tab === "resolved" && n.resolved)) &&
          (!type || n.type === type) &&
          (!severity || n.severity === severity),
      ),
    [items, tab, type, severity],
  );

  const act = async (fn, ...args) => {
    setError("");
    try {
      await fn(...args);
      setItems(await fetchNotifications());
    } catch {
      setError("تعذّر تحديث التنبيهات. حاول مرة أخرى.");
    }
  };

  return (
    <div dir="rtl" className="w-full p-6 space-y-5">
      <Breadcrumb>
        <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
        <Breadcrumb.Current>التنبيهات</Breadcrumb.Current>
      </Breadcrumb>
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">التنبيهات</h1>
          <p className="text-sm text-gray-500">أعطال الأجهزة والبوابات وحالات التشغيل غير الطبيعية</p>
        </div>
        <button
          onClick={() => act(markAllRead)}
          disabled={stats.unread === 0}
          className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40"
        >
          تعليم الكل كمقروء
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="تنبيهات نشطة" value={stats.active} color="text-gray-800" />
        <StatCard label="حرجة" value={stats.critical} color="text-red-600" />
        <StatCard label="غير مقروءة" value={stats.unread} color="text-blue-600" />
        <StatCard label="تمت معالجتها" value={stats.resolved} color="text-green-600" />
      </div>

      {/* Tabs + Filters */}
      <div className="bg-white rounded-xl shadow-sm p-3 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-lg text-sm ${tab === t.key ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
            <option value="">كل الأنواع</option>
            {Object.entries(TYPES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
            <option value="">كل المستويات</option>
            {Object.entries(SEVERITY).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading && <div className="text-center text-gray-400 py-10">جارِ التحميل...</div>}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400">✅ لا توجد تنبيهات</div>
        )}

        {filtered.map((n) => {
          const t = TYPES[n.type];
          const s = SEVERITY[n.severity];
          return (
            <div key={n.id} className={`bg-white rounded-xl shadow-sm p-4 border-r-4 ${s.bar} ${n.resolved ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="text-2xl">{t?.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm text-gray-800 ${n.read ? "" : "font-bold"}`}>{n.title}</h3>
                      {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                      <span className={`px-2 py-0.5 rounded-full text-xs ${s.badge}`}>{s.label}</span>
                      {n.resolved && <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">تمت المعالجة</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                    <div className="text-xs text-gray-400 mt-2">
                      {t?.label} · {timeAgo(n.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 text-xs shrink-0">
                  {n.link && (
                    <Link to={n.link} onClick={() => !n.read && markRead(n.id)} className="text-blue-600 hover:underline">
                      عرض التفاصيل
                    </Link>
                  )}
                  {!n.read && (
                    <button onClick={() => act(markRead, n.id)} className="text-gray-500 hover:underline">
                      تعليم كمقروء
                    </button>
                  )}
                  {!n.resolved && (
                    <button onClick={() => act(resolveNotification, n.id)} className="text-green-600 hover:underline">
                      تمت المعالجة
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
