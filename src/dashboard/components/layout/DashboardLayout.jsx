import { useState } from "react";
import { Outlet } from "react-router-dom";
import { styled } from "@mui/material/styles";

import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

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

      <Main open={open}>
        <Outlet />
      </Main>
    </div>
  );
}
