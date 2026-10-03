import { Routes, Route } from "react-router-dom";

import WebsiteRoutes from "./website/routes/WebsiteRoutes";
import DashboardRoutes from "./dashboard/routes/DashboardRoutes";

export default function App() {
  return (
    <Routes>
      {/* Website */}
      <Route path="/*" element={<WebsiteRoutes />} />

      {/* Dashboard */}
      <Route path="/dashboard/*" element={<DashboardRoutes />} />
    </Routes>
  );
}