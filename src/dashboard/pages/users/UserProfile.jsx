import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, UsersRound, Camera, BriefcaseBusiness } from "lucide-react";
import Breadcrumb from "../../components/common/Breadcrumb";
import profileImage from "../../../assets/images/profile.jpeg";

const API_URL = "http://localhost:3000";
const PROFILE_USER_ID = "1";
const TABS = ["نظرة عامة", "تعديل الملف الشخصي", "الإعدادات", "تغيير كلمة المرور"];
const TAB_LABELS = {
  overview: "نظرة عامة",
  edit: "تعديل الملف الشخصي",
  settings: "الإعدادات",
  password: "تغيير كلمة المرور",
};

export default function UserProfile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TAB_LABELS[searchParams.get("tab")] || TAB_LABELS.overview;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    about: "",
    company: "",
    job: "",
    country: "",
    address: "",
    phone: "",
    email: "",
    twitter: "",
    facebook: "",
    instagram: "",
    linkedin: "",
  });

  useEffect(() => {
    axios
      .get(`${API_URL}/users/${PROFILE_USER_ID}`)
      .then(({ data }) => {
        setProfile((current) => ({ ...current, ...data }));
        setError("");
      })
      .catch(() => setError("تعذر تحميل بيانات الملف الشخصي. تحقق من اتصال قاعدة البيانات ثم أعد تحميل الصفحة."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setProfile((current) => ({ ...current, [e.target.name]: e.target.value }));
    setSaveMessage("");
  };

  const selectTab = (tab) => {
    const tabKey = Object.keys(TAB_LABELS).find((key) => TAB_LABELS[key] === tab);
    setSearchParams(tabKey === "overview" ? {} : { tab: tabKey });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaveMessage("");

    try {
      const { data } = await axios.patch(`${API_URL}/users/${PROFILE_USER_ID}`, profile);
      setProfile((current) => ({ ...current, ...data }));
      setSaveMessage("تم حفظ التغييرات بنجاح.");
    } catch {
      setError("تعذر حفظ التغييرات. تحقق من اتصال قاعدة البيانات ثم حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div dir="rtl" className="p-6 text-gray-500">جارِ تحميل بيانات الملف الشخصي...</div>;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="mx-auto max-w-6xl">
        <Breadcrumb>
          <Breadcrumb.Link to="/dashboard">لوحة التحكم</Breadcrumb.Link>
          <Breadcrumb.Current>الملف الشخصي</Breadcrumb.Current>
        </Breadcrumb>
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">الملف الشخصي</h1>
        </div>

        {error && <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left card */}
          <div className="lg:w-1/3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center pt-2 text-center">
                <img src={profileImage} alt="الصورة الشخصية" className="h-24 w-24 rounded-full object-cover" />
                <h2 className="mt-3 text-lg font-semibold text-gray-800">{profile.fullName || "المستخدم"}</h2>
                <h3 className="text-sm text-gray-500">{profile.job}</h3>
                {(profile.twitter || profile.facebook || profile.instagram || profile.linkedin) && (
                  <div className="mt-3 flex gap-3">
                    <a href={profile.twitter} aria-label="تويتر" className="text-sky-500 hover:text-sky-600">
                      <Send size={18} />
                    </a>
                    <a href={profile.facebook} aria-label="فيسبوك" className="text-blue-700 hover:text-blue-800">
                      <UsersRound size={18} />
                    </a>
                    <a href={profile.instagram} aria-label="إنستغرام" className="text-pink-500 hover:text-pink-600">
                      <Camera size={18} />
                    </a>
                    <a href={profile.linkedin} aria-label="لينكدإن" className="text-blue-500 hover:text-blue-600">
                      <BriefcaseBusiness size={18} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right card */}
          <div className="lg:w-2/3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              {/* Tabs */}
              <div className="flex flex-wrap gap-1 border-b border-gray-200">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => selectTab(tab)}
                    className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Overview */}
              {activeTab === "نظرة عامة" && (
                <div className="pt-5">
                  <h5 className="font-semibold text-gray-800">نبذة</h5>
                  <p className="mt-1 text-sm italic text-gray-500">{profile.about || "لا توجد نبذة مسجلة."}</p>

                  <h5 className="mt-5 font-semibold text-gray-800">تفاصيل الملف الشخصي</h5>
                  <div className="mt-2 divide-y divide-gray-100">
                    {[
                      ["الاسم الكامل", profile.fullName],
                      ["اسم المستخدم", profile.username],
                      ["الشركة", profile.company],
                      ["الدور الوظيفي", profile.job],
                      ["الهاتف", profile.phone],
                      ["البريد الإلكتروني", profile.email],
                    ]
                      .filter(([, value]) => value)
                      .map(([label, value]) => (
                        <div key={label} className="grid grid-cols-3 gap-4 py-2 text-sm">
                          <div className="text-gray-500">{label}</div>
                          <div className="col-span-2 text-gray-800">{value}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Edit Profile */}
              {activeTab === "تعديل الملف الشخصي" && (
                <form className="space-y-4 pt-5" onSubmit={handleSubmit}>
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <img src={profileImage} alt="الصورة الشخصية" className="h-16 w-16 rounded-full object-cover" />
                    <div className="flex gap-2">
                      <button type="button" className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
                        رفع صورة
                      </button>
                      <button type="button" className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700">
                        إزالة
                      </button>
                    </div>
                  </div>

                  {[
                    { label: "الاسم الكامل", name: "fullName" },
                    { label: "الشركة", name: "company" },
                    { label: "الوظيفة", name: "job" },
                    { label: "الدولة", name: "country" },
                    { label: "العنوان", name: "address" },
                    { label: "الهاتف", name: "phone" },
                    { label: "البريد الإلكتروني", name: "email" },
                    { label: "حساب تويتر", name: "twitter" },
                    { label: "حساب فيسبوك", name: "facebook" },
                    { label: "حساب إنستغرام", name: "instagram" },
                    { label: "حساب لينكدإن", name: "linkedin" },
                  ].map(({ label, name }) => (
                    <div key={name} className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center">
                      <label className="text-sm text-gray-600">{label}</label>
                      <input
                        name={name}
                        value={profile[name]}
                        onChange={handleChange}
                        className="sm:col-span-3 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-start">
                    <label className="text-sm text-gray-600">نبذة</label>
                    <textarea
                      name="about"
                      value={profile.about}
                      onChange={handleChange}
                      rows={3}
                      className="sm:col-span-3 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 text-center">
                    <button type="submit" disabled={saving} className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                      {saving ? "جارِ الحفظ..." : "حفظ التغييرات"}
                    </button>
                    {saveMessage && <p role="status" className="mt-2 text-sm text-green-700">{saveMessage}</p>}
                  </div>
                </form>
              )}

              {/* Settings */}
              {activeTab === "الإعدادات" && (
                <form className="pt-5">
                  <p className="mb-2 text-sm font-medium text-gray-700">إشعارات البريد الإلكتروني</p>
                  <div className="space-y-2">
                    {[
                      { label: "التغييرات التي تطرأ على حسابك", checked: true },
                      { label: "معلومات عن المنتجات والخدمات الجديدة", checked: true },
                      { label: "العروض التسويقية والترويجية", checked: false },
                      { label: "تنبيهات الأمان", checked: true, disabled: true },
                    ].map(({ label, checked, disabled }) => (
                      <label key={label} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          defaultChecked={checked}
                          disabled={disabled}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <div className="pt-5 text-center">
                    <button type="submit" className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">
                      حفظ التغييرات
                    </button>
                  </div>
                </form>
              )}

              {/* Change Password */}
              {activeTab === "تغيير كلمة المرور" && (
                <form className="space-y-4 pt-5">
                  {[
                    { label: "كلمة المرور الحالية", name: "currentPassword" },
                    { label: "كلمة المرور الجديدة", name: "newPassword" },
                    { label: "إعادة إدخال كلمة المرور الجديدة", name: "renewPassword" },
                  ].map(({ label, name }) => (
                    <div key={name} className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center">
                      <label className="text-sm text-gray-600">{label}</label>
                      <input
                        type="password"
                        name={name}
                        className="sm:col-span-3 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}
                  <div className="pt-2 text-center">
                    <button type="submit" className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">
                      تغيير كلمة المرور
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
