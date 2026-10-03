import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";

// Correct path relative to src/dashboard/components/layout
import logo from "../../../assets/images/logo-white.png";

// Icons
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HomeIcon from "@mui/icons-material/Home";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import GroupsIcon from "@mui/icons-material/Groups";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DoorFrontIcon from "@mui/icons-material/DoorFront";
import DevicesIcon from "@mui/icons-material/Devices";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
// import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import HistoryIcon from "@mui/icons-material/History";

const drawerWidth = 240;
const mobileDrawerWidth = 180;

// Dark navy sidebar (slate-900 -> blue-950) built on the same Tailwind blue
// family as the rest of the app. Light text + bright blue icons on top of it.
const palette = {
  // Background
  bg: "linear-gradient(180deg, #0f172a 0%, #172554 100%)", // slate-900 -> blue-950
  border: "rgba(255, 255, 255, 0.08)",

  // Text
  text: "#e2e8f0", // slate-200
  textMuted: "#94a3b8", // slate-400
  active: "#ffffff",

  // States
  hoverBg: "rgba(255, 255, 255, 0.06)",
  activeBg: "rgba(96, 165, 250, 0.16)", // blue-400 @ 16%
  accent: "#60a5fa", // blue-400 (active indicator bar)

  // Icons
  icon: "#60a5fa", // blue-400  -> default
  iconHover: "#93c5fd", // blue-300  -> hover
  iconActive: "#dbeafe", // blue-100  -> active route
};

const openedMixin = (theme) => ({
  width: drawerWidth,

  [theme.breakpoints.down("sm")]: {
    width: mobileDrawerWidth,
  },

  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),

  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),

  overflowX: "hidden",

  width: 44,

  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  borderBottom: `1px solid ${palette.border}`,

  ...theme.mixins.toolbar,
}));

// Shared paper styles (background, border, slim dark scrollbar).
const paperBase = {
  background: palette.bg,
  color: palette.text,
  borderColor: palette.border,

  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: 999,
  },
  "&::-webkit-scrollbar-track": { background: "transparent" },
};

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",

  "& .MuiDrawer-paper": paperBase,

  ...(open && {
    ...openedMixin(theme),

    "& .MuiDrawer-paper": {
      ...paperBase,
      ...openedMixin(theme),
    },
  }),

  ...(!open && {
    ...closedMixin(theme),

    "& .MuiDrawer-paper": {
      ...paperBase,
      ...closedMixin(theme),
    },
  }),
}));

// Thin accent bar on the edge of the active top-level item.
// Uses a logical property so it sits on the right edge in RTL.
const activeIndicator = {
  content: '""',
  position: "absolute",
  insetInlineStart: -8, // item has mx: 1 (8px) -> touches the drawer edge
  top: 10,
  bottom: 10,
  width: 3,
  borderRadius: 999,
  backgroundColor: palette.accent,
};

// Shared styles so parent and leaf items look identical.
const itemSx = (open) => ({
  position: "relative",
  minHeight: 48,
  mx: 1,
  px: { xs: 1, sm: 1.5 },
  borderRadius: 1.5, // rounded-md (6px)
  justifyContent: open ? "initial" : "center",
  color: palette.text,
  transition: "background-color 0.2s ease, color 0.2s ease",
  "&:hover": {
    backgroundColor: palette.hoverBg,
  },
  "&.active": {
    color: palette.active,
    backgroundColor: palette.activeBg,
    fontWeight: 600,
  },
  "&.active::before": activeIndicator,
  // Leaf items (NavLink) get the `.active` class from react-router,
  // so we recolor their icon here.
  "&.active .MuiListItemIcon-root": {
    color: palette.iconActive,
  },
});

// Base icon style (shared by parent and leaf items).
const iconSx = (open, isActive = false) => ({
  minWidth: 0,
  justifyContent: "center",
  ml: open ? { xs: 0.5, sm: 3 } : "auto",
  color: isActive ? palette.iconActive : palette.icon,
  transition: "color 0.2s ease, transform 0.2s ease",
});

const menu = [
  {
    name: "الرئيسية",
    path: "/dashboard",
    icon: <HomeIcon />,
  },
  {
    name: "إدارة الجهات والبلديات",
    path: "/dashboard/organizations",
    icon: <AccountTreeIcon />,
    children: [
      { name: "عرض الجهات", path: "/dashboard/organizations" },
      { name: "إضافة جهة", path: "/dashboard/organizations/add" },
    ],
  },
  {
    name: "إدارة المشاريع",
    path: "/dashboard/projects",
    icon: <BusinessCenterIcon />,
    children: [
      { name: "عرض المشاريع", path: "/dashboard/projects" },
      { name: "إضافة مشروع", path: "/dashboard/projects/add" },
    ],
  },
  {
    name: "إدارة المقاولين",
    path: "/dashboard/contractors",
    icon: <GroupsIcon />,
    children: [
      { name: "عرض المقاولين", path: "/dashboard/contractors" },
      { name: "إضافة مقاول", path: "/dashboard/contractors/add" },
    ],
  },
  {
    name: "إدارة المواقع",
    path: "/dashboard/sites",
    icon: <LocationOnIcon />,
    children: [
      { name: "عرض المواقع", path: "/dashboard/sites" },
      { name: "إضافة موقع", path: "/dashboard/sites/add" },
    ],
  },
  {
    name: "إدارة البوابات",
    path: "/dashboard/gates",
    icon: <DoorFrontIcon />,
    children: [
      { name: "عرض البوابات", path: "/dashboard/gates" },
      { name: "إضافة بوابة", path: "/dashboard/gates/add" },
    ],
  },
  {
    name: "إدارة الأجهزة",
    path: "/dashboard/devices",
    icon: <DevicesIcon />,
    children: [
      { name: "عرض الأجهزة", path: "/dashboard/devices" },
      { name: "إضافة جهاز", path: "/dashboard/devices/add" },
    ],
  },
  {
    name: "المركبات",
    path: "/dashboard/vehicles",
    icon: <DirectionsCarIcon />,
    children: [
      { name: "عرض المركبات", path: "/dashboard/vehicles" },
      { name: "إضافة مركبة", path: "/dashboard/vehicles/add" },
    ],
  },
  {
    name: "المعاملات",
    path: "/dashboard/transactions",
    icon: <AssignmentIcon />,
    children: [
      { name: "كل المعاملات", path: "/dashboard/transactions" },
      { name: "معاملات الدخول", path: "/dashboard/transactions/entry" },
      { name: "معاملات الخروج", path: "/dashboard/transactions/exit" },
    ],
  },
  {
    name: "التقارير",
    path: "/dashboard/reports",
    icon: <DescriptionIcon />,
  },
  // {
  //   name: "منصة مدينتي",
  //   icon: <DesktopWindowsIcon />,
  // },
  {
    name: "التنبيهات",
    path: "/dashboard/notifications",
    icon: <NotificationsIcon />,
  },
  {
    name: "المستخدمين والصلاحيات",
    path: "/dashboard/users",
    icon: <AdminPanelSettingsIcon />,
    children: [
      { name: "عرض المستخدمين", path: "/dashboard/users" },
      { name: "إضافة مستخدم", path: "/dashboard/users/add" },
      { name: "الأدوار", path: "/dashboard/users/roles" },
      { name: "الصلاحيات", path: "/dashboard/users/permissions" },
    ],
  },
  // {
  //   name: "سجل التدقيق",
  //   icon: <HistoryIcon />,
  // },
];

export default function Sidebar({ open, handleDrawerClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Open the group that matches the current route once, on first render.
  // After that, expand/collapse is controlled purely by user clicks,
  // not by the current location — this is what fixes the "won't close" bug.
  const [expandedPath, setExpandedPath] = useState(() => {
    const activeParent = menu.find((item) => item.children?.length && location.pathname.startsWith(item.path));
    return activeParent ? activeParent.path : null;
  });

  const handleToggle = (path) => {
    setExpandedPath((prev) => (prev === path ? null : path));
  };

  return (
    <Drawer variant="permanent" anchor="right" open={open}>
      <DrawerHeader sx={{ justifyContent: open ? "space-between" : "flex-end" }}>
        {/* Logo: only visible when the sidebar is expanded.
            Transparent PNG with light lettering, so it sits directly on the dark background. */}
        {open && (
          <Box
            component={NavLink}
            to="/dashboard"
            aria-label="WAQT"
            sx={{
              height: 34,
              px: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box component="img" src={logo} alt="WAQT" sx={{ height: "100%", width: "auto", objectFit: "contain", display: "block" }} />
          </Box>
        )}

        <IconButton
          onClick={handleDrawerClose}
          sx={{
            color: palette.textMuted,
            "&:hover": { color: palette.active, backgroundColor: palette.hoverBg },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      </DrawerHeader>

      <Divider sx={{ borderColor: palette.border }} />

      <List sx={{ py: 1 }}>
        {menu.map((item) => {
          const hasChildren = Boolean(item.children?.length);
          const isActiveGroup = location.pathname.startsWith(item.path);
          const isExpanded = expandedPath === item.path;

          return (
            <ListItem key={item.name} disablePadding sx={{ display: "block", mb: 0.5 }}>
              {hasChildren ? (
                // Parent item with children:
                //  - clicking the ROW (text / arrow) only expands/collapses the group
                //  - clicking the ICON only navigates to the list page
                <ListItemButton
                  onClick={() => (open ? handleToggle(item.path) : navigate(item.path))}
                  sx={{
                    ...itemSx(open),
                    color: isActiveGroup ? palette.active : palette.text,
                    backgroundColor: isActiveGroup ? palette.activeBg : "transparent",
                    fontWeight: isActiveGroup ? 600 : 400,
                    "&:hover": {
                      backgroundColor: isActiveGroup ? palette.activeBg : palette.hoverBg,
                    },
                    ...(isActiveGroup && { "&::before": activeIndicator }),
                  }}
                >
                  <ListItemIcon
                    title={item.children[0].name}
                    onClick={(e) => {
                      // Don't let the click bubble up and toggle the group.
                      e.stopPropagation();
                      navigate(item.path);
                    }}
                    // Also stops the parent's ripple effect when pressing the icon.
                    onMouseDown={(e) => e.stopPropagation()}
                    sx={{
                      ...iconSx(open, isActiveGroup),
                      cursor: "pointer",
                      "&:hover": {
                        color: palette.iconHover,
                        transform: "scale(1.15)",
                      },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.name}
                    sx={{
                      minWidth: 0,
                      opacity: open ? 1 : 0,
                      "& .MuiListItemText-primary": {
                        fontSize: "1rem",
                        fontWeight: "inherit",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },
                    }}
                  />

                  {open && (isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                </ListItemButton>
              ) : (
                // Leaf item: a normal navigable link.
                <ListItemButton component={NavLink} to={item.path} end={item.path === "/dashboard"} sx={itemSx(open)}>
                  <ListItemIcon sx={iconSx(open)}>{item.icon}</ListItemIcon>

                  <ListItemText
                    primary={item.name}
                    sx={{
                      minWidth: 0,
                      opacity: open ? 1 : 0,
                      "& .MuiListItemText-primary": {
                        fontSize: "1rem",
                        fontWeight: "inherit",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },
                    }}
                  />
                </ListItemButton>
              )}

              {hasChildren && (
                <Collapse in={open && isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ mt: 0.5 }}>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.path}
                        component={NavLink}
                        to={child.path}
                        end={child.path === item.path}
                        sx={{
                          minHeight: 40,
                          mx: 1,
                          mb: 0.5,
                          pr: 5,
                          pl: 2,
                          borderRadius: 1.5,
                          fontSize: "0.95rem",
                          color: palette.textMuted,
                          transition: "background-color 0.2s ease, color 0.2s ease",
                          "&:hover": {
                            color: palette.text,
                            backgroundColor: palette.hoverBg,
                          },
                          "&.active": {
                            color: palette.active,
                            backgroundColor: palette.activeBg,
                            fontWeight: 600,
                          },
                          "& .MuiListItemText-primary": {
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          },
                        }}
                      >
                        <ListItemText primary={child.name} sx={{ minWidth: 0 }} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}
