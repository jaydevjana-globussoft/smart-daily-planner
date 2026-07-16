import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CalendarMonthRounded,
  ChecklistRounded,
  DashboardRounded,
  FlagRounded,
  LogoutRounded,
  NotificationsNoneRounded,
  PersonOutlineRounded,
  SettingsOutlined,
  TodayRounded,
  TrendingUpRounded,
} from "@mui/icons-material";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography } from "@mui/material";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: DashboardRounded },
  { to: "/schedule", label: "Today's Schedule", icon: TodayRounded },
  { to: "/activities", label: "Activities", icon: ChecklistRounded },
  { to: "/calendar", label: "Calendar", icon: CalendarMonthRounded },
  { to: "/goals", label: "Goals", icon: FlagRounded },
  { to: "/notifications", label: "Notifications", icon: NotificationsNoneRounded },
  { to: "/progress", label: "Progress", icon: TrendingUpRounded },
  { to: "/settings", label: "Settings", icon: SettingsOutlined },
  { to: "/profile", label: "Profile", icon: PersonOutlineRounded },
];

function Sidebar({ collapsed, darkMode, onItemClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    ["userId", "userName", "userEmail"].forEach((key) => localStorage.removeItem(key));
    navigate("/login", { replace: true });
    onItemClick?.();
  };

  const background = darkMode ? "#0f172a" : "#13233f";

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", p: collapsed ? 1 : 1.5, bgcolor: background, color: "common.white", overflowX: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1, py: 1.5, mb: 1 }}>
        <Box sx={{ width: 34, height: 34, display: "grid", placeItems: "center", borderRadius: 2, bgcolor: "primary.main", fontWeight: 800 }}>S</Box>
        {!collapsed && <Typography variant="subtitle1" fontWeight={800} noWrap>Smart Planner</Typography>}
      </Box>
      <List component={motion.ul} initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.04 } } }} disablePadding sx={{ flexGrow: 1 }}>
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          const item = (
            <ListItemButton component={motion.div} variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} whileHover={{ x: 3 }} key={to} onClick={() => { navigate(to); onItemClick?.(); }} selected={active} sx={{ minHeight: 46, mb: 0.5, px: collapsed ? 1.25 : 1.5, borderRadius: 2, color: "rgba(255,255,255,0.78)", "&.Mui-selected, &.Mui-selected:hover": { bgcolor: "rgba(97, 161, 255, 0.2)", color: "common.white", "& .MuiListItemIcon-root": { color: "#93c5fd" } }, "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}>
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: "inherit", justifyContent: "center" }}><Icon fontSize="small" /></ListItemIcon>
              {!collapsed && <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500 }} />}
            </ListItemButton>
          );
          return collapsed ? <Tooltip key={to} title={label} placement="right">{item}</Tooltip> : item;
        })}
      </List>
      <Tooltip title={collapsed ? "Logout" : ""} placement="right"><ListItemButton onClick={handleLogout} sx={{ minHeight: 46, px: collapsed ? 1.25 : 1.5, borderRadius: 2, color: "rgba(255,255,255,0.8)", "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}><ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: "inherit", justifyContent: "center" }}><LogoutRounded fontSize="small" /></ListItemIcon>{!collapsed && <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />}</ListItemButton></Tooltip>
    </Box>
  );
}

export default Sidebar;
