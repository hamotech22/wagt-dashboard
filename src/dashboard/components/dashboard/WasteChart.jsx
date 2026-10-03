import { useEffect, useState } from "react";
import axios from "axios";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

export default function WasteChart() {
  const [data, setData] = useState([]);
  const [totalWaste, setTotalWaste] = useState(null);

  const COLORS = ["#2563eb", "#14b8a6", "#f59e0b", "#8b5cf6", "#94a3b8"];

  useEffect(() => {
    axios
      .get("http://localhost:3000/wasteTypes")
      .then((response) => {
        const wasteTypes = Array.isArray(response?.data) ? response.data : [];
        const total = wasteTypes.find((item) => item.type === "total");

        setData(wasteTypes.filter((item) => item.type !== "total"));
        setTotalWaste(total ? { value: total.value, unit: total.unit } : null);
      })
      .catch(() => {
        setData([]);
        setTotalWaste(null);
      });
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" dir="rtl">
      {/* العنوان */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-800">توزيع أنواع النفايات</h2>

          <p className="mt-1 text-sm text-slate-400">حسب نوع النفايات</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
          <DeleteSweepIcon />
        </div>
      </div>

      {/* Chart + البيانات */}
      <div className="flex items-center gap-5">
        {/* Donut Chart */}
        <div className="h-[210px] w-[210px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={0}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>

              {/* Hover Tooltip */}
              <Tooltip
                formatter={(value, name) => [`${value}%`, name]}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                  direction: "rtl",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* النص داخل الدائرة */}
          <div className="-mt-[135px] flex flex-col items-center justify-center">
            <span className="text-sm text-slate-400">الإجمالي</span>

            <span className="text-lg font-bold text-slate-800">
              {totalWaste?.value?.toLocaleString("en-US") ?? "—"}
            </span>

            <span className="text-sm text-slate-500">{totalWaste?.unit ?? ""}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-4">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: COLORS[index],
                  }}
                />

                <span className="text-sm text-slate-600">{item.name}</span>
              </div>

              <span className="text-sm font-semibold text-slate-700">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
