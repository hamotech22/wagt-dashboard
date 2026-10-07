import { useLayoutEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { styled } from "@mui/material/styles";

import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import { useTheme } from "../../../theme/ThemeContext";

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  marginRight: open ? 240 : 65,
  paddingTop: 80,
  paddingLeft: 0,
  paddingRight: 0,

  [theme.breakpoints.down("sm")]: {
    marginRight: open ? 180 : 44,
  },
}));

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { darkMode } = useTheme();

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);

    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [darkMode]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className="min-h-screen">
      <Topbar open={open} handleDrawerOpen={handleDrawerOpen} />

      <Sidebar open={open} handleDrawerClose={handleDrawerClose} />

      <Main open={open} className="min-h-screen bg-slate-100 dark:bg-slate-950">
        <Outlet />
      </Main>
    </div>
  );
}
