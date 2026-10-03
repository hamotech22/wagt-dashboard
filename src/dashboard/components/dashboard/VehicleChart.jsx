import { useEffect, useState } from "react";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function VehicleChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/vehicleMovement")
      .then((response) => {
        setData(response?.data ?? []);
      })
      .catch(() => setData([]));
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" dir="rtl">
      {/* العنوان */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold text-slate-800">حركة المركبات (دخول / خروج)</h2>
      </div>

      {/* Legend */}
      <div className="mb-2 flex items-center gap-5 text-sm">
        {/* دخول */}
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600">دخول</span>
        </div>

        {/* خروج */}
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span className="text-slate-600">خروج</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[230px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: 0,
              bottom: 0,
            }}
          >
            {/* Grid */}
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="0" vertical={true} horizontal={true} />

            {/* الأيام */}
            <XAxis
              dataKey="day"
              tick={{
                fontSize: 12,
                fill: "#64748b",
              }}
              axisLine={false}
              tickLine={false}
            />

            {/* الأرقام */}
            <YAxis
              domain={[0, 200]}
              ticks={[0, 50, 100, 150, 200]}
              tick={{
                fontSize: 12,
                fill: "#64748b",
              }}
              axisLine={false}
              tickLine={false}
              width={35}
            />

            {/* Hover */}
            <Tooltip
              cursor={{
                stroke: "#94a3b8",
                strokeDasharray: "4 4",
              }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
                direction: "rtl",
              }}
              formatter={(value, name) => [`${value} مركبة`, name]}
            />

            {/* دخول */}
            <Area
              type="monotone"
              dataKey="entry"
              name="دخول"
              stroke="#10b981"
              strokeWidth={2}
              fill="#10b981"
              fillOpacity={0.12}
              dot={{
                r: 3,
                fill: "#10b981",
                strokeWidth: 0,
              }}
              activeDot={{
                r: 5,
              }}
            />

            {/* خروج */}
            <Area
              type="monotone"
              dataKey="exit"
              name="خروج"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="#3b82f6"
              fillOpacity={0.1}
              dot={{
                r: 3,
                fill: "#3b82f6",
                strokeWidth: 0,
              }}
              activeDot={{
                r: 5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
