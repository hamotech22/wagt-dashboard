import { styled, alpha } from "@mui/material/styles";
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
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
// import Typography from "@mui/material/Typography";
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
import HomeIcon from "@mui/icons-material/Home";

const drawerWidth = 240;
const API_URL = "http://localhost:3000";

// AppBar
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,

  overflow: "hidden", // added

  // ---- Added: colors only, to match the Sidebar ----
  backgroundColor: "#0f172a", // slate-900, same as the top of the Sidebar gradient
  // background: "linear-gradient(90deg, #172554 0%, #0f172a 100%)", // optional: gradient instead of solid
  boxShadow: "none",
  borderBottom: "1px solid rgba(255, 255, 255, 0.08)", // same divider color as the Sidebar
  // --------------------------------------------------

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
}));

// Search
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,

  backgroundColor: alpha(theme.palette.common.white, 0.15),

  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },

  marginRight: theme.spacing(3),

  width: "300px",
}));

// Search Icon
const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),

  height: "100%",

  position: "absolute",

  pointerEvents: "none",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",
}));

// Search Input
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",

  width: "100%",

  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),

    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  },
}));

export default function Topbar({ open, handleDrawerOpen }) {
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

  const openNotifications = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const closeNotifications = () => {
    setNotificationsAnchor(null);
  };

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
            marginLeft: 5,

            ...(open && {
              display: "none",
            }),
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title */}

        {/* Search */}

        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>

          <StyledInputBase
            placeholder=" "
            inputProps={{
              "aria-label": "search",
            }}
          />
        </Search>

        {/* Right Side */}

        <Box
          sx={{
            marginRight: "auto",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {/* User Profile */}

          <IconButton
            color="inherit"
            aria-label="قائمة المستخدم"
            title="قائمة المستخدم"
            onClick={(event) => setProfileAnchor(event.currentTarget)}
          >
            <Avatar src="https://i.pravatar.cc/150?img=12" alt="الصورة الشخصية" sx={{ width: 24, height: 24 }}>
              <AccountCircleIcon sx={{ fontSize: 20 }} />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={() => setProfileAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <MenuItem onClick={goToProfile}>عرض الملف الشخصي</MenuItem>
            <Divider />
            <MenuItem onClick={logout} sx={{ color: "error.main" }}>تسجيل خروج</MenuItem>
          </Menu>

          {/* Notifications */}

          <IconButton color="inherit" aria-label={`الإشعارات غير المقروءة: ${unreadCount}`} title="الإشعارات" onClick={openNotifications}>
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationsAnchor}
            open={Boolean(notificationsAnchor)}
            onClose={closeNotifications}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
            PaperProps={{ sx: { width: 360, maxWidth: "calc(100vw - 32px)", maxHeight: 420 } }}
          >
            <Box sx={{ px: 2, py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle2" fontWeight={700}>
                الإشعارات غير المقروءة ({unreadCount})
              </Typography>
            </Box>
            {unreadNotifications.length === 0 ? (
              <MenuItem disabled>
                <ListItemText primary="لا توجد إشعارات غير مقروءة" />
              </MenuItem>
            ) : (
              unreadNotifications.slice(0, 5).map((notification) => (
                <MenuItem
                  key={notification.id}
                  onClick={() => goToNotification(notification)}
                  sx={{ whiteSpace: "normal", alignItems: "flex-start", py: 1.25 }}
                >
                  <ListItemText
                    primary={notification.title || "تنبيه جديد"}
                    secondary={notification.message || ""}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 600, dir: "rtl" }}
                    secondaryTypographyProps={{ fontSize: 12, dir: "rtl", sx: { mt: 0.5 } }}
                  />
                </MenuItem>
              ))
            )}
            <MenuItem
              onClick={() => {
                closeNotifications();
                navigate("/dashboard/notifications");
              }}
              sx={{ justifyContent: "center", borderTop: "1px solid", borderColor: "divider", color: "primary.main" }}
            >
              <ListItemText primary="عرض كل الإشعارات" primaryTypographyProps={{ textAlign: "center", fontSize: 13, fontWeight: 600 }} />
            </MenuItem>
          </Menu>

          {/* Settings */}

          <IconButton
            color="inherit"
            aria-label="الإعدادات"
            title="الإعدادات"
            onClick={(event) => setSettingsAnchor(event.currentTarget)}
          >
            <SettingsIcon />
          </IconButton>
          <Menu
            anchorEl={settingsAnchor}
            open={Boolean(settingsAnchor)}
            onClose={() => setSettingsAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <MenuItem onClick={goToNotificationSettings}>
              <ListItemIcon>
                <TuneIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="تفضيلات الإشعارات" />
            </MenuItem>
            <MenuItem onClick={goToNotificationsPage}>
              <ListItemIcon>
                <NotificationsActiveIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="إدارة التنبيهات" />
            </MenuItem>
          </Menu>

          {/* Main Website */}

          <IconButton
            color="inherit"
            aria-label="الموقع الرئيسي"
            title="الموقع الرئيسي"
            onClick={() => navigate("/")}
            sx={{ borderInlineStart: "1px solid rgba(255,255,255,0.2)", borderRadius: 0, paddingInlineStart: 1.5 }}
          >
            <HomeIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
