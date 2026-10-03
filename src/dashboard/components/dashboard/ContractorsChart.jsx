import { useEffect, useState } from "react";
import axios from "axios";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function ContractorsChart() {
  const [data, setData] = useState([]);

  const colors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#64748b"];

  useEffect(() => {
    axios
      .get("http://localhost:3000/contractorWeights")
      .then((response) => {
        setData(response?.data ?? []);
      })
      .catch(() => setData([]));
  }, []);

  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm" dir="rtl">
      {/* العنوان */}
      <div className="mb-5">
        <h2 className="text-base font-bold text-slate-800">الوزن حسب المقاولين</h2>

        <p className="mt-1 text-sm text-slate-400">إجمالي الوزن حسب المقاول</p>
      </div>

      {/* الرسم البياني */}
      <div className="h-65 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 5,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="0" vertical={false} />

            <XAxis
              dataKey="name"
              tick={{
                fontSize: 12,
                fill: "#64748b",
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[0, 1400]}
              ticks={[0, 200, 400, 600, 800, 1000, 1200, 1400]}
              tick={{
                fontSize: 12,
                fill: "#64748b",
              }}
              axisLine={false}
              tickLine={false}
              width={40}
            />

            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
                direction: "rtl",
              }}
              formatter={(value) => [`${value} طن`, "الوزن"]}
            />

            <Bar
              dataKey="value"
              radius={[5, 5, 0, 0]}
              barSize={38}
              label={{
                position: "top",
                fill: "#475569",
                fontSize: 12,
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
