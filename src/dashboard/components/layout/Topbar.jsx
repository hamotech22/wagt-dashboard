import { styled, alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
// import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const drawerWidth = 240;

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

  const goToProfile = () => {
    navigate("/dashboard/vehicles/profile");
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
          {/* Notifications */}

          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>

          {/* Settings */}

          <IconButton color="inherit">
            <SettingsIcon />
          </IconButton>

          {/* User Profile */}

          <Box
            onClick={goToProfile}
            title="الملف الشخصي"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              marginRight: 1,
              cursor: "pointer",
            }}
          >
            <Avatar
              src="https://i.pravatar.cc/150?img=12"
              alt="الصورة الشخصية"
              sx={{ width: 24, height: 24 }}
            >
              <AccountCircleIcon sx={{ fontSize: 20 }} />
            </Avatar>

            {/* <Box>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Mohamed Yahya
              </Typography>

              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Admin
              </Typography>
            </Box> */}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
