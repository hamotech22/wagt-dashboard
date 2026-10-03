import { useState } from "react";
import { Outlet } from "react-router-dom";

import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Topbar open={open} handleDrawerOpen={handleDrawerOpen} />

      <Sidebar open={open} handleDrawerClose={handleDrawerClose} />

      <main
        style={{
          marginRight: open ? 240 : 65,
          paddingTop: 80,
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
