import { useState, useEffect, useCallback } from "react";
import { 
  DarkModeRounded, 
  LightModeRounded, 
  MenuRounded, 
  NotificationsNoneRounded, 
  GetAppRounded
} from "@mui/icons-material";
import { 
  AppBar, 
  Avatar, 
  Badge, 
  Box, 
  IconButton, 
  Stack, 
  Toolbar, 
  Tooltip, 
  Typography,
  Button,
  Menu,
  MenuItem,
  Divider,
  ListItemText
} from "@mui/material";
import { usePWA } from "../../context/pwaContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";

function Header({ darkMode, onMenuClick, onThemeToggle }) {
  const navigate = useNavigate();
  const { isInstallable, installApp, notificationPermission, requestNotificationPermission } = usePWA();
  const userName = localStorage.getItem("userName") || "Planner";
  const userId = localStorage.getItem("userId");
  const currentDate = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date());

  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await axios.get(`${API_BASE_URL}/notifications/history/${userId}`);
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to load notifications in Header:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleNotificationsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    try {
      await axios.post(`${API_BASE_URL}/notifications/mark-read`, { userId });
      fetchNotifications();
      handleNotificationsClose();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleNotificationItemClick = async (notif) => {
    if (!userId) return;
    try {
      await axios.post(`${API_BASE_URL}/notifications/mark-read`, { userId, notificationIds: [notif._id] });
      fetchNotifications();
      handleNotificationsClose();
      navigate("/notifications");
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentNotifications = notifications.slice(0, 5);

  return (
    <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: darkMode ? "#101827" : "rgba(255,255,255,0.92)", color: darkMode ? "common.white" : "text.primary", borderBottom: "1px solid", borderColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.07)", backdropFilter: "blur(12px)" }}>
      <Toolbar sx={{ minHeight: { xs: 64, sm: 72 } }}>
        <IconButton onClick={onMenuClick} edge="start" sx={{ mr: { xs: 1, md: 2 }, color: "inherit" }}><MenuRounded /></IconButton>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}><Typography variant="subtitle1" fontWeight={750} noWrap>Good to see you, {userName.split(" ")[0]}</Typography><Typography variant="caption" color="text.secondary">{currentDate}</Typography></Box>
        <Stack direction="row" spacing={{ xs: 0.25, sm: 0.75 }} alignItems="center">
          
          {/* PWA Install Button */}
          {isInstallable && (
            <Tooltip title="Install App">
              <IconButton color="primary" onClick={installApp}>
                <GetAppRounded />
              </IconButton>
            </Tooltip>
          )}

          {/* Enable Notifications Permission Banner */}
          {notificationPermission === "default" && (
            <Button 
              size="small" 
              variant="contained" 
              color="warning" 
              onClick={requestNotificationPermission} 
              sx={{ textTransform: "none", fontSize: "0.75rem", borderRadius: 2, mr: 1, display: { xs: "none", sm: "inline-flex" } }}
            >
              Enable Notifications
            </Button>
          )}

          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationsClick}>
              <Badge color="error" badgeContent={unreadCount}>
                <NotificationsNoneRounded />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notifications Dropdown Menu */}
          <Menu 
            anchorEl={anchorEl} 
            open={Boolean(anchorEl)} 
            onClose={handleNotificationsClose} 
            PaperProps={{ sx: { width: 320, maxHeight: 400, mt: 1.5, borderRadius: 3, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" } }}
          >
            <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" fontWeight={700}>Notifications</Typography>
              {unreadCount > 0 && (
                <Button size="small" onClick={handleMarkAllRead} sx={{ textTransform: "none", fontSize: "0.75rem" }}>
                  Mark all read
                </Button>
              )}
            </Box>
            <Divider />
            {recentNotifications.length === 0 ? (
              <MenuItem disabled sx={{ py: 3, justifyContent: "center" }}>
                <Typography variant="body2" color="text.secondary">No notifications yet</Typography>
              </MenuItem>
            ) : (
              recentNotifications.map((notif) => (
                <MenuItem 
                  key={notif._id} 
                  onClick={() => handleNotificationItemClick(notif)} 
                  sx={{ py: 1.5, bgcolor: notif.read ? "transparent" : "action.hover", borderLeft: notif.read ? "0" : "4px solid #4f46e5" }}
                >
                  <ListItemText 
                    primary={notif.title} 
                    secondary={notif.message} 
                    primaryTypographyProps={{ fontSize: 13, fontWeight: notif.read ? 500 : 700 }} 
                    secondaryTypographyProps={{ fontSize: 11, color: "text.secondary", sx: { overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } }} 
                  />
                </MenuItem>
              ))
            )}
            <Divider />
            <MenuItem onClick={() => { handleNotificationsClose(); navigate("/notifications"); }} sx={{ justifyContent: "center", py: 1.25 }}>
              <Typography variant="caption" color="primary.main" fontWeight={700}>View all history</Typography>
            </MenuItem>
          </Menu>

          <Tooltip title={darkMode ? "Use light mode" : "Use dark mode"}><IconButton color="inherit" onClick={onThemeToggle}>{darkMode ? <LightModeRounded /> : <DarkModeRounded />}</IconButton></Tooltip>
          <Avatar sx={{ ml: 0.5, width: 34, height: 34, bgcolor: "primary.main", fontSize: 14 }}>{userName.charAt(0).toUpperCase()}</Avatar>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
