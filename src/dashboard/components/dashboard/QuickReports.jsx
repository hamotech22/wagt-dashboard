import { useEffect, useState } from "react";
import axios from "axios";

import PeopleIcon from "@mui/icons-material/People";
import ScaleIcon from "@mui/icons-material/Scale";
import RecyclingIcon from "@mui/icons-material/Recycling";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import { Link } from "react-router-dom";

export default function QuickReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/reports")
      .then((response) => {
        setReports(response?.data ?? []);
      })
      .catch(() => setReports([]));
  }, []);

  const icons = {
    contractors: <PeopleIcon />,
    weights: <ScaleIcon />,
    waste: <RecyclingIcon />,
    locations: <BusinessCenterIcon />,
  };

  const colors = {
    contractors: "text-blue-600",
    weights: "text-emerald-500",
    waste: "text-teal-500",
    locations: "text-blue-500",
  };

  const backgrounds = {
    contractors: "bg-blue-50",
    weights: "bg-emerald-50",
    waste: "bg-teal-50",
    locations: "bg-blue-50",
  };

  return (
    <div className="h-full w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" dir="rtl">
      {/* العنوان */}
      <h2 className="mb-5 text-lg font-bold text-slate-800">التقارير السريعة</h2>

      {/* التقارير */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {reports.map((report) => (
          <button
            key={report.id}
            className="flex h-[110px] flex-col items-center justify-center rounded-lg border border-slate-100 bg-white px-2 sm:h-[135px]"
          >
            {/* الأيقونة */}
            <div
              className={`mb-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:mb-4 sm:h-12 sm:w-12 ${backgrounds[report.type]} ${colors[report.type]}`}
            >
              {icons[report.type]}
            </div>

            {/* اسم التقرير */}
            <span className="text-center text-sm font-semibold text-slate-700">{report.title}</span>
          </button>
        ))}
      </div>

      {/* زر جميع التقارير */}
      <Link
        to="/dashboard/reports"
        className="mx-auto mt-5 block w-full rounded-lg border border-slate-200 px-12 py-2 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50 sm:w-auto"
      >
        جميع التقارير
      </Link>
    </div>
  );
}
