import { styled } from "@mui/material/styles";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import TuneIcon from "@mui/icons-material/Tune";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import profileImage from "../../../assets/images/profile.jpeg";

const drawerWidth = 240;
const mobileDrawerWidth = 180;
const API_URL = "http://localhost:3000";

// Same design language as the Sidebar.
const palette = {
  bg: [
    "radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.18) 0%, transparent 42%)",
    "radial-gradient(circle at 0% 100%, rgba(37, 99, 235, 0.16) 0%, transparent 45%)",
    "linear-gradient(180deg, #0f172a 0%, #0c1a3d 55%, #172554 100%)",
  ].join(", "),
  border: "rgba(255, 255, 255, 0.08)",
  text: "#e2e8f0",
  textSoft: "#cbd5e1",
  textMuted: "#94a3b8",
  hoverBg: "rgba(255, 255, 255, 0.06)",
  accent: "#60a5fa",
  danger: "#f87171",
};

const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/* ------------------------------------------------------------------ */
/*  Shared styles for ALL dropdown menus (profile / notifications /    */
/*  settings) so they look identical.                                  */
/* ------------------------------------------------------------------ */

// Applied on the <Menu> root so it works regardless of MUI version / theme overrides.
const menuRootSx = (extra = {}) => ({
  "& .MuiPaper-root": {
    mt: 1,
    minWidth: 230,
    p: 0.75,
    borderRadius: "16px",
    color: palette.text,
    background: `${palette.bg} !important`,
    backgroundColor: "#0f172a !important",
    border: `1px solid ${palette.border}`,
    boxShadow: "0 16px 40px rgba(2, 6, 23, 0.55)",
    textAlign: "right",
    ...extra,
  },
  "& .MuiList-root": { p: 0 },
});

const menuItemSx = {
  mx: 0.25,
  my: 0.25,
  px: 1.25,
  minHeight: 44,
  gap: 1.25,
  borderRadius: 2,
  color: palette.textSoft,
  fontSize: "0.9rem",
  transition: "background-color 0.2s ease, color 0.2s ease",
  "&:hover, &.Mui-focusVisible": {
    backgroundColor: palette.hoverBg,
    color: "#ffffff",
    "& .menu-chip": { backgroundColor: rgba(palette.accent, 0.26) },
  },
  "&.Mui-disabled": { opacity: 1, color: palette.textMuted },
};

const menuChipSx = (color = palette.accent) => ({
  width: 30,
  height: 30,
  borderRadius: 2,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color,
  backgroundColor: rgba(color, 0.14),
  border: `1px solid ${rgba(color, 0.28)}`,
  transition: "background-color 0.2s ease",
  "& svg": { fontSize: 18 },
});

const menuTextSx = {
  m: 0,
  "& .MuiListItemText-primary": { fontSize: "0.9rem", fontWeight: 600, textAlign: "right" },
  "& .MuiListItemText-secondary": { fontSize: "0.75rem", textAlign: "right", color: palette.textMuted },
};

function MenuHeader({ icon, title, subtitle, end }) {
  return (
    <Box
      dir="rtl"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        px: 1.25,
        pt: 0.75,
        pb: 1.25,
        mb: 0.5,
        borderBottom: `1px solid ${palette.border}`,
      }}
    >
      {icon}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#ffffff", lineHeight: 1.4 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography noWrap sx={{ fontSize: "0.72rem", color: palette.textMuted, lineHeight: 1.4 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {end}
    </Box>
  );
}

// Shared look for the round icon buttons in the bar.
const topIconSx = {
  width: 38,
  height: 38,
  borderRadius: 2,
  color: palette.textSoft,
  transition: "background-color 0.2s ease, color 0.2s ease",
  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)", color: "#ffffff" },
};

// AppBar
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  overflow: "hidden",
  backgroundColor: "#0f172a",
  boxShadow: "none",
  borderBottom: `1px solid ${palette.border}`,

  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),

  ...(open && {
    marginRight: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),

  [theme.breakpoints.down("sm")]: open && {
    marginRight: mobileDrawerWidth,
    width: `calc(100% - ${mobileDrawerWidth}px)`,
  },
}));

// Search
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 12,
  backgroundColor: "rgba(255, 255, 255, 0.06)",
  border: `1px solid ${palette.border}`,
  transition: "background-color 0.2s ease, border-color 0.2s ease",
  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.09)" },
  "&:focus-within": { borderColor: "rgba(96, 165, 250, 0.5)", backgroundColor: "rgba(255, 255, 255, 0.09)" },
  marginRight: theme.spacing(3),
  width: "300px",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: palette.textMuted,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: palette.text,
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  },
}));

export default function Topbar({
  open,
  handleDrawerOpen,
  user = { name: "مدير النظام", role: "Administrator" },
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const unreadCount = unreadNotifications.length;

  const goToProfile = () => {
    setProfileAnchor(null);
    navigate("/dashboard/vehicles/profile");
  };

  const logout = () => {
    setProfileAnchor(null);
    navigate("/login");
  };

  useEffect(() => {
    let active = true;

    const loadUnreadNotifications = () => {
      axios
        .get(`${API_URL}/notifications`)
        .then(({ data }) => {
          if (active) setUnreadNotifications(data.filter((notification) => !notification.read));
        })
        .catch((error) => {
          if (active) console.error("تعذّر تحميل الإشعارات غير المقروءة.", error);
        });
    };

    loadUnreadNotifications();
    const intervalId = window.setInterval(loadUnreadNotifications, 30000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [pathname]);

  const openNotifications = (event) => setNotificationsAnchor(event.currentTarget);
  const closeNotifications = () => setNotificationsAnchor(null);

  const goToNotification = (notification) => {
    closeNotifications();
    navigate(notification.link || "/dashboard/notifications");
  };

  const goToNotificationSettings = () => {
    setSettingsAnchor(null);
    navigate("/dashboard/vehicles/profile?tab=settings");
  };

  const goToNotificationsPage = () => {
    setSettingsAnchor(null);
    navigate("/dashboard/notifications");
  };

  // Same anchor/transform for every menu.
  const menuPosition = {
    anchorOrigin: { vertical: "bottom", horizontal: "center" },
    transformOrigin: { vertical: "top", horizontal: "center" },
    MenuListProps: { dir: "rtl" },
  };

  return (
    <AppBar position="fixed" open={open}>
      <Toolbar>
        {/* Menu Button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{
            ...topIconSx,
            marginLeft: 5,
            ...(open && { display: "none" }),
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Search */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>

          <StyledInputBase placeholder=" " inputProps={{ "aria-label": "search" }} />
        </Search>

        {/* Right Side */}
        <Box sx={{ marginRight: "auto", display: "flex", alignItems: "center", gap: 0.5 }}>
          {/* ---------------- User Profile ---------------- */}
          <IconButton
            aria-label="قائمة المستخدم"
            title="قائمة المستخدم"
            onClick={(event) => setProfileAnchor(event.currentTarget)}
            sx={topIconSx}
          >
            <Avatar
              src={profileImage}
              alt="الصورة الشخصية"
              sx={{ width: 28, height: 28, border: `2px solid ${palette.accent}` }}
            >
              <AccountCircleIcon sx={{ fontSize: 20 }} />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={() => setProfileAnchor(null)}
            {...menuPosition}
            sx={menuRootSx()}
          >
            <MenuHeader
              icon={
                <Avatar src={profileImage} alt={user.name} sx={{ width: 38, height: 38, border: `2px solid ${palette.accent}` }}>
                  <AccountCircleIcon />
                </Avatar>
              }
              title={user.name}
              subtitle={user.role}
            />

            <MenuItem onClick={goToProfile} sx={menuItemSx}>
              <ListItemIcon sx={{ minWidth: 0 }}>
                <Box className="menu-chip" sx={menuChipSx()}>
                  <PersonIcon />
                </Box>
              </ListItemIcon>
              <ListItemText primary="عرض الملف الشخصي" sx={menuTextSx} />
            </MenuItem>

            <MenuItem
              onClick={logout}
              sx={{
                ...menuItemSx,
                color: "#fca5a5",
                "&:hover, &.Mui-focusVisible": {
                  backgroundColor: rgba(palette.danger, 0.12),
                  color: "#fecaca",
                  "& .menu-chip": { backgroundColor: rgba(palette.danger, 0.26) },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0 }}>
                <Box className="menu-chip" sx={menuChipSx(palette.danger)}>
                  <LogoutIcon />
                </Box>
              </ListItemIcon>
              <ListItemText primary="تسجيل خروج" sx={menuTextSx} />
            </MenuItem>
          </Menu>

          {/* ---------------- Notifications ---------------- */}
          <IconButton
            aria-label={`الإشعارات غير المقروءة: ${unreadCount}`}
            title="الإشعارات"
            onClick={openNotifications}
            sx={topIconSx}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              max={99}
              sx={{ "& .MuiBadge-badge": { fontSize: 10, height: 16, minWidth: 16, border: "2px solid #0f172a" } }}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationsAnchor}
            open={Boolean(notificationsAnchor)}
            onClose={closeNotifications}
            {...menuPosition}
            sx={menuRootSx({ width: 300, maxWidth: "calc(100vw - 32px)", maxHeight: 360 })}
          >
            <MenuHeader
              icon={
                <Box sx={menuChipSx()}>
                  <NotificationsIcon />
                </Box>
              }
              title="الإشعارات غير المقروءة"
              subtitle={unreadCount ? `${unreadCount} إشعار جديد` : "لا يوجد جديد"}
            />

            {unreadNotifications.length === 0 ? (
              <MenuItem disabled sx={menuItemSx}>
                <ListItemText primary="لا توجد إشعارات غير مقروءة" sx={menuTextSx} />
              </MenuItem>
            ) : (
              unreadNotifications.slice(0, 5).map((notification) => (
                <MenuItem
                  key={notification.id}
                  onClick={() => goToNotification(notification)}
                  sx={{ ...menuItemSx, minHeight: 0, py: 0.75, gap: 1, whiteSpace: "normal", alignItems: "flex-start" }}
                >
                  {/* compact unread dot instead of a big icon chip */}
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      mt: 0.9,
                      borderRadius: "50%",
                      flexShrink: 0,
                      backgroundColor: palette.accent,
                      boxShadow: `0 0 8px ${palette.accent}`,
                    }}
                  />
                  <ListItemText
                    primary={notification.title || "تنبيه جديد"}
                    secondary={notification.message || ""}
                    sx={{
                      ...menuTextSx,
                      "& .MuiListItemText-primary": {
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        textAlign: "right",
                        color: "#ffffff",
                      },
                      "& .MuiListItemText-secondary": {
                        fontSize: "0.72rem",
                        textAlign: "right",
                        color: palette.textMuted,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      },
                    }}
                  />
                </MenuItem>
              ))
            )}

            <MenuItem
              onClick={() => {
                closeNotifications();
                navigate("/dashboard/notifications");
              }}
              sx={{
                ...menuItemSx,
                justifyContent: "center",
                minHeight: 36,
                mt: 0.5,
                borderTop: `1px solid ${palette.border}`,
                borderRadius: 2,
                color: palette.accent,
                "&:hover, &.Mui-focusVisible": { backgroundColor: rgba(palette.accent, 0.12), color: "#93c5fd" },
              }}
            >
              <ListItemText primary="عرض كل الإشعارات" sx={{ ...menuTextSx, "& .MuiListItemText-primary": { fontSize: "0.85rem", fontWeight: 600, textAlign: "center" } }} />
            </MenuItem>
          </Menu>

          {/* ---------------- Settings ---------------- */}
          <IconButton
            aria-label="الإعدادات"
            title="الإعدادات"
            onClick={(event) => setSettingsAnchor(event.currentTarget)}
            sx={topIconSx}
          >
            <SettingsIcon />
          </IconButton>
          <Menu
            anchorEl={settingsAnchor}
            open={Boolean(settingsAnchor)}
            onClose={() => setSettingsAnchor(null)}
            {...menuPosition}
            sx={menuRootSx()}
          >
            <MenuHeader
              icon={
                <Box sx={menuChipSx()}>
                  <SettingsIcon />
                </Box>
              }
              title="الإعدادات"
            />

            <MenuItem onClick={goToNotificationSettings} sx={menuItemSx}>
              <ListItemIcon sx={{ minWidth: 0 }}>
                <Box className="menu-chip" sx={menuChipSx()}>
                  <TuneIcon />
                </Box>
              </ListItemIcon>
              <ListItemText primary="تفضيلات الإشعارات" sx={menuTextSx} />
            </MenuItem>

            <MenuItem onClick={goToNotificationsPage} sx={menuItemSx}>
              <ListItemIcon sx={{ minWidth: 0 }}>
                <Box className="menu-chip" sx={menuChipSx()}>
                  <NotificationsActiveIcon />
                </Box>
              </ListItemIcon>
              <ListItemText primary="إدارة التنبيهات" sx={menuTextSx} />
            </MenuItem>
          </Menu>

          {/* ---------------- Main Website ---------------- */}
          <IconButton
            aria-label="الموقع الرئيسي"
            title="الموقع الرئيسي"
            onClick={() => navigate("/")}
            sx={{
              ...topIconSx,
              width: "auto",
              minWidth: 46,
              ml: 0.5,
              borderInlineStart: `1px solid ${palette.border}`,
              borderRadius: 0,
              paddingInlineStart: 1.5,
              "&:hover": { backgroundColor: "transparent", color: "#ffffff" },
            }}
          >
            <HomeIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}