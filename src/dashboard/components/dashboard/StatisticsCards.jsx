import { useEffect, useState } from "react";
import axios from "axios";

import ScaleIcon from "@mui/icons-material/Scale";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ErrorIcon from "@mui/icons-material/Error";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

const defaultIcons = ["scale", "shipping", "car", "error", "time", "completed"];

const defaultBgClasses = {
  scale: "bg-blue-500",
  shipping: "bg-amber-500",
  car: "bg-emerald-500",
  error: "bg-red-500",
  time: "bg-violet-500",
  completed: "bg-sky-500",
};

const normalizeCards = (data) =>
  (Array.isArray(data) ? data : []).map((card, index) => {
    const icon = card.icon ?? defaultIcons[index % defaultIcons.length];
    const positive = card.positive ?? card.type !== "negative";

    return {
      ...card,
      positive,
      icon,
      iconBg: card.iconBg ?? defaultBgClasses[icon] ?? "bg-slate-500",
    };
  });

export default function StatisticsCards() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/statistics")
      .then((response) => {
        setCards(normalizeCards(response?.data ?? []));
      })
      .catch(() => setCards([]));
  }, []);

  const icons = {
    scale: <ScaleIcon />,
    shipping: <LocalShippingIcon />,
    car: <DirectionsCarIcon />,
    error: <ErrorIcon />,
    time: <AccessTimeIcon />,
    completed: <TaskAltIcon />,
  };

  return (
    <div dir="rtl" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <div key={card.title} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-slate-700">{card.title}</p>

            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-white ${card.iconBg}`}>
              {icons[card.icon] ?? <ScaleIcon />}
            </div>
          </div>

          <p className="mt-5 text-3xl font-bold text-blue-900">{card.value}</p>

          <div className="mt-4 flex items-center justify-between">
            <span className={`text-sm font-semibold ${card.positive ? "text-emerald-600" : "text-red-600"}`}>
              {card.positive ? "↑" : "↓"} {card.percentage}
            </span>

            <span className="text-sm text-slate-400">مقارنة بالسابق</span>
          </div>
        </div>
      ))}
    </div>
  );
}
