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
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import Popover from "@mui/material/Popover";
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
import NotificationsIcon from "@mui/icons-material/Notifications";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const drawerWidth = 240;
const mobileDrawerWidth = 180;

const palette = {
  bg: [
    "radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.18) 0%, transparent 42%)",
    "radial-gradient(circle at 0% 100%, rgba(37, 99, 235, 0.16) 0%, transparent 45%)",
    "linear-gradient(180deg, #0f172a 0%, #0c1a3d 55%, #172554 100%)",
  ].join(", "),
  border: "rgba(255, 255, 255, 0.08)",

  text: "#e2e8f0",
  textMuted: "#94a3b8",
  sectionLabel: "rgba(148, 163, 184, 0.65)",
  active: "#ffffff",

  hoverBg: "rgba(255, 255, 255, 0.06)",
  activeBg: "linear-gradient(to left, rgba(59, 130, 246, 0.26) 0%, rgba(59, 130, 246, 0.04) 100%)",
  accent: "#60a5fa",

  chipBg: "rgba(96, 165, 250, 0.10)",
  chipBgHover: "rgba(96, 165, 250, 0.20)",
  chipActiveBg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  chipActiveShadow: "0 4px 14px rgba(37, 99, 235, 0.45)",
  icon: "#60a5fa",
  iconActive: "#ffffff",

  flyoutBg: "#0f172a",
};

// One uniform accent for every icon.
const colorOf = () => palette.accent;

const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
const rowActiveBg = (c) => `linear-gradient(to left, ${rgba(c, 0.24)} 0%, ${rgba(c, 0.03)} 100%)`;
const chipActiveBgOf = () => palette.chipActiveBg;
const chipActiveShadowOf = () => palette.chipActiveShadow;
const ICON_ON_COLOR = "#ffffff";

const openedMixin = (theme) => ({
  width: drawerWidth,
  [theme.breakpoints.down("sm")]: { width: mobileDrawerWidth },
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
  width: 52,
  [theme.breakpoints.up("sm")]: { width: `calc(${theme.spacing(8)} + 1px)` },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1.5),
  borderBottom: `1px solid ${palette.border}`,
  flexShrink: 0,
  ...theme.mixins.toolbar,
}));

// The paper itself never scrolls: header + footer stay pinned,
// only the middle menu area scrolls (so nothing is ever cut off).
const paperBase = {
  background: palette.bg,
  color: palette.text,
  borderLeft: `1px solid ${palette.border}`,
  boxShadow: "-8px 0 24px rgba(2, 6, 23, 0.25)",
  display: "flex",
  flexDirection: "column",
  overflowY: "hidden",
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
    "& .MuiDrawer-paper": { ...paperBase, ...openedMixin(theme) },
  }),

  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": { ...paperBase, ...closedMixin(theme) },
  }),
}));

const scrollAreaSx = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(255, 255, 255, 0.22) transparent",
  "&::-webkit-scrollbar": { width: 5 },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255, 255, 255, 0.22)", borderRadius: 999 },
  "&::-webkit-scrollbar-track": { background: "transparent" },
};

const activeIndicator = (c = palette.accent) => ({
  content: '""',
  position: "absolute",
  insetInlineStart: -8,
  top: 10,
  bottom: 10,
  width: 3,
  borderRadius: 999,
  backgroundColor: c,
  boxShadow: `0 0 10px ${c}`,
});

const itemSx = (open, c = palette.accent) => ({
  position: "relative",
  minHeight: 44,
  "@media (max-height: 800px)": { minHeight: 40 },
  mx: 1,
  px: open ? { xs: 0.75, sm: 1 } : 0.75,
  borderRadius: 2.5,
  justifyContent: open ? "initial" : "center",
  color: palette.text,
  transition: "background-color 0.2s ease, color 0.2s ease, transform 0.2s ease",

  "&:hover": { backgroundColor: palette.hoverBg },
  "&:hover .nav-chip": { backgroundColor: rgba(c, 0.26), transform: "scale(1.06)" },

  "&.active": {
    color: palette.active,
    background: rowActiveBg(c),
    fontWeight: 600,
  },
  "&.active::before": activeIndicator(c),
  "&.active .nav-chip": {
    background: chipActiveBgOf(c),
    boxShadow: chipActiveShadowOf(c),
    border: "1px solid transparent",
    color: ICON_ON_COLOR,
  },
});

const chipSx = (isActive = false, c = palette.accent) => ({
  width: 32,
  height: 32,
  borderRadius: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: isActive ? ICON_ON_COLOR : c,
  background: isActive ? chipActiveBgOf(c) : rgba(c, 0.14),
  border: `1px solid ${isActive ? "transparent" : rgba(c, 0.28)}`,
  boxShadow: isActive ? chipActiveShadowOf(c) : "none",
  transition: "background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
  "& svg": { fontSize: 20 },
});

// Sub-item (toggle child) style: used by BOTH the expanded tree and the collapsed flyout,
// so they always look identical.
const subItemSx = {
  position: "relative",
  minHeight: 38,
  mb: 0.25,
  pr: 2,
  pl: 1.5,
  borderRadius: 2,
  fontSize: "0.9rem",
  textAlign: "right",
  textDecoration: "none",
  color: palette.textMuted,
  transition: "background-color 0.2s ease, color 0.2s ease",

  // dot
  "&::before": {
    content: '""',
    width: 6,
    height: 6,
    borderRadius: "50%",
    marginInlineEnd: 1.25,
    flexShrink: 0,
    backgroundColor: "rgba(148, 163, 184, 0.45)",
    transition: "background-color 0.2s ease, box-shadow 0.2s ease",
  },

  "&:hover": { color: palette.text, backgroundColor: palette.hoverBg },
  "&:hover::before": { backgroundColor: palette.accent },

  "&.active": {
    color: palette.active,
    backgroundColor: rgba(palette.accent, 0.16),
    fontWeight: 600,
  },
  "&.active::before": {
    backgroundColor: palette.accent,
    boxShadow: `0 0 8px ${palette.accent}`,
  },

  "& .MuiListItemText-root": { minWidth: 0, m: 0 },
  "& .MuiListItemText-primary": {
    fontSize: "inherit",
    fontWeight: "inherit",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};

const labelSx = {
  minWidth: 0,
  m: 0,
  "& .MuiListItemText-primary": {
    fontSize: "0.95rem",
    fontWeight: "inherit",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};

const menu = [
  { section: "نظرة عامة", name: "الرئيسية", path: "/dashboard", icon: <HomeIcon /> },
  {
    section: "الإدارة",
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
    section: "العمليات",
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
  { section: "التقارير والتنبيهات", name: "التقارير", path: "/dashboard/reports", icon: <DescriptionIcon /> },
  { name: "التنبيهات", path: "/dashboard/notifications", icon: <NotificationsIcon />, badgeKey: "notifications" },
  {
    section: "النظام",
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
];

/**
 * Props:
 *  - open, handleDrawerClose: same as before.
 *  - unreadCount (optional): number shown as a red badge on "التنبيهات".
 */
export default function Sidebar({ open, handleDrawerClose, unreadCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [expandedPath, setExpandedPath] = useState(() => {
    const activeParent = menu.find((item) => item.children?.length && location.pathname.startsWith(item.path));
    return activeParent ? activeParent.path : null;
  });

  // Flyout submenu used when the sidebar is collapsed.
  const [flyout, setFlyout] = useState(null); // { anchor, item }

  const handleToggle = (path) => setExpandedPath((prev) => (prev === path ? null : path));

  // The flyout header icon mirrors exactly how that item looks in the sidebar.
  const flyoutActive =
    Boolean(flyout) && flyout.item.path !== "/dashboard" && location.pathname.startsWith(flyout.item.path);

  const renderChip = (item, isActive) => {
    const count = item.badgeKey === "notifications" ? unreadCount : 0;
    return (
      <Badge
        badgeContent={count}
        color="error"
        max={99}
        overlap="rectangular"
        sx={{ "& .MuiBadge-badge": { fontSize: 10, height: 16, minWidth: 16, border: "2px solid #0f172a" } }}
      >
        <Box className="nav-chip" sx={chipSx(isActive, colorOf(item))}>
          {item.icon}
        </Box>
      </Badge>
    );
  };

  return (
    <Drawer variant="permanent" anchor="right" open={open}>
      {/* ---------- Header (pinned) ---------- */}
      <DrawerHeader sx={{ justifyContent: open ? "space-between" : "center" }}>
        {open && (
          <Box
            component={NavLink}
            to="/dashboard"
            aria-label="WAQT"
            sx={{ height: 34, px: 1, display: "flex", alignItems: "center" }}
          >
            <Box component="img" src={logo} alt="WAQT" sx={{ height: "100%", width: "auto", objectFit: "contain", display: "block" }} />
          </Box>
        )}

        {open && (
          <IconButton
            onClick={handleDrawerClose}
            size="small"
            aria-label="إغلاق القائمة"
            sx={{
              color: palette.textMuted,
              backgroundColor: palette.hoverBg,
              border: `1px solid ${palette.border}`,
              borderRadius: 2,
              "&:hover": { color: palette.active, backgroundColor: "rgba(255,255,255,0.12)" },
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
      </DrawerHeader>

      {/* ---------- Scrollable menu ---------- */}
      <Box sx={scrollAreaSx}>
        <List sx={{ pt: 1, pb: 2, px: 0 }}>
          {menu.map((item, index) => {
            const hasChildren = Boolean(item.children?.length);
            const isActiveGroup = location.pathname.startsWith(item.path) && item.path !== "/dashboard";
            const isExpanded = expandedPath === item.path;

            return (
              <ListItem key={item.name} disablePadding sx={{ display: "block", mb: 0.25 }}>
                {item.section &&
                  (open ? (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        px: 2.5,
                        pt: index === 0 ? 0.25 : 1.25,
                        pb: 0.5,
                        color: palette.sectionLabel,
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        letterSpacing: 0.4,
                      }}
                    >
                      {item.section}
                    </Typography>
                  ) : (
                    index > 0 && <Divider sx={{ borderColor: palette.border, my: 1, mx: 2 }} />
                  ))}

                {hasChildren ? (
                  <Tooltip title={open || flyout ? "" : item.name} placement="left" arrow>
                    <ListItemButton
                      onClick={(e) => (open ? handleToggle(item.path) : setFlyout({ anchor: e.currentTarget, item }))}
                      sx={{
                        ...itemSx(open, colorOf(item)),
                        color: isActiveGroup ? palette.active : palette.text,
                        background: isActiveGroup ? rowActiveBg(colorOf(item)) : "transparent",
                        fontWeight: isActiveGroup ? 600 : 400,
                        "&:hover": { backgroundColor: isActiveGroup ? undefined : palette.hoverBg },
                        ...(isActiveGroup && { "&::before": activeIndicator(colorOf(item)) }),
                      }}
                    >
                      <ListItemIcon
                        title={open ? item.children[0].name : undefined}
                        onClick={(e) => {
                          // Expanded: icon navigates, row toggles. Collapsed: let the click open the flyout.
                          if (!open) return;
                          e.stopPropagation();
                          navigate(item.path);
                        }}
                        onMouseDown={(e) => open && e.stopPropagation()}
                        sx={{
                          minWidth: 0,
                          marginInlineEnd: open ? 1.5 : 0,
                          cursor: "pointer",
                        }}
                      >
                        {renderChip(item, isActiveGroup)}
                      </ListItemIcon>

                      {open && <ListItemText primary={item.name} sx={labelSx} />}

                      {open && (
                        <ExpandMoreIcon
                          fontSize="small"
                          sx={{
                            color: palette.textMuted,
                            transition: "transform 0.25s ease",
                            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>
                ) : (
                  <Tooltip title={open ? "" : item.name} placement="left" arrow>
                    <ListItemButton component={NavLink} to={item.path} end={item.path === "/dashboard"} sx={itemSx(open, colorOf(item))}>
                      <ListItemIcon sx={{ minWidth: 0, marginInlineEnd: open ? 1.5 : 0 }}>
                        {renderChip(item, false)}
                      </ListItemIcon>

                      {open && <ListItemText primary={item.name} sx={labelSx} />}
                    </ListItemButton>
                  </Tooltip>
                )}

                {hasChildren && (
                  <Collapse in={open && isExpanded} timeout="auto" unmountOnExit>
                    <List
                      component="div"
                      disablePadding
                      sx={{
                        mt: 0.5,
                        mb: 0.5,
                        mx: 1,
                        marginInlineStart: { xs: 3, sm: 3.25 },
                        paddingInlineStart: 1,
                        borderInlineStart: `1px solid ${isActiveGroup ? rgba(colorOf(item), 0.45) : palette.border}`,
                      }}
                    >
                      {item.children.map((child) => (
                        <ListItemButton
                          key={child.path}
                          component={NavLink}
                          to={child.path}
                          end={child.path === item.path}
                          sx={subItemSx}
                        >
                          <ListItemText primary={child.name} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* ---------- Flyout submenu (collapsed mode) ----------
          Rendered in a portal outside the sidebar. The dark background, border and radius
          live on an inner Box we fully control, and the Paper is made transparent,
          so the text is always readable regardless of the app theme. */}
      <Popover
        anchorEl={flyout?.anchor}
        open={Boolean(flyout)}
        onClose={() => setFlyout(null)}
        anchorOrigin={{ vertical: "center", horizontal: "left" }}
        transformOrigin={{ vertical: "center", horizontal: "right" }}
        PaperProps={{ elevation: 0 }}
        sx={{
          "& .MuiPaper-root": {
            ml: -1,
            p: 0,
            overflow: "visible",
            backgroundColor: "transparent !important",
            backgroundImage: "none !important",
            boxShadow: "none !important",
            border: "none",
          },
        }}
      >
        <Box
          dir="rtl"
          sx={{
            minWidth: 220,
            p: 0.75,
            borderRadius: 3,
            textAlign: "right",
            backgroundColor: palette.flyoutBg,
            backgroundImage: palette.bg,
            color: palette.text,
            border: `1px solid ${palette.border}`,
            boxShadow: "0 16px 40px rgba(2, 6, 23, 0.55)",
          }}
        >
          {/* Header: icon chip + section name */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 1,
              pt: 0.5,
              pb: 1,
              mb: 0.5,
              borderBottom: `1px solid ${palette.border}`,
            }}
          >
            <Box sx={chipSx(flyoutActive)}>
              {flyout?.item.icon}
            </Box>
            <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>
              {flyout?.item.name}
            </Typography>
          </Box>

          {flyout?.item.children.map((child) => (
            <ListItemButton
              key={child.path}
              component={NavLink}
              to={child.path}
              end
              onClick={() => setFlyout(null)}
              sx={subItemSx}
            >
              <ListItemText primary={child.name} />
            </ListItemButton>
          ))}
        </Box>
      </Popover>
    </Drawer>
  );
}