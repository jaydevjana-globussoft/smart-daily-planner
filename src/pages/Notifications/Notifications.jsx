import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  Stack, 
  Chip, 
  Alert, 
  IconButton,
  Skeleton,
  Divider
} from "@mui/material";
import { 
  DeleteSweepRounded, 
  DoneAllRounded, 
  NotificationsActiveRounded, 
  NotificationsOffRounded,
  NotificationsNoneRounded
} from "@mui/icons-material";
import axios from "axios";
import MainLayout from "../../components/layout/MainLayout";
import { usePWA } from "../../context/pwaContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";

const categoryColors = {
  work: "#2563eb",
  gym: "#dc2626",
  hobby: "#16a34a",
  "personal-goal": "#f97316",
  break: "#7c3aed",
  sleep: "#475569"
};

const getCategoryColor = (category) => categoryColors[category?.toLowerCase()] || "#64748b";

function Notifications() {
  const { notificationPermission, requestNotificationPermission, isSubscribed } = usePWA();
  const userId = localStorage.getItem("userId");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchHistory = useCallback(async (showLoader = false) => {
    if (!userId) return;
    if (showLoader) setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API_BASE_URL}/notifications/history/${userId}`);
      if (data.success) {
        setNotifications(data.notifications);
      } else {
        throw new Error(data.message || "Failed to load notification history");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load notification history");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory(true);
  }, [fetchHistory]);

  const handleMarkAllRead = async () => {
    if (!userId || notifications.length === 0) return;
    setActionLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/notifications/mark-read`, { userId });
      await fetchHistory();
    } catch (err) {
      setError("Failed to mark notifications as read.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!userId || notifications.length === 0) return;
    if (!window.confirm("Are you sure you want to clear your entire notification history?")) return;
    setActionLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/notifications/clear`, { userId });
      setNotifications([]);
    } catch (err) {
      setError("Failed to clear notification history.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleItemClick = async (notif) => {
    if (notif.read) return;
    try {
      await axios.post(`${API_BASE_URL}/notifications/mark-read`, { 
        userId, 
        notificationIds: [notif._id] 
      });
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark item read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const cardMotion = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        
        {/* Title Section */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>Notification Center</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Stay on track with dynamic schedule alerts and reminders.
            </Typography>
          </Box>
          <Chip label={`${unreadCount} new`} color={unreadCount > 0 ? "error" : "default"} variant="outlined" />
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Permission Banner */}
        {notificationPermission === "default" && (
          <Alert 
            severity="warning" 
            icon={<NotificationsActiveRounded />}
            sx={{ mb: 3.5, borderRadius: 3, boxShadow: "0 4px 15px rgba(245, 158, 11, 0.15)" }}
            action={
              <Button size="small" color="inherit" variant="outlined" onClick={requestNotificationPermission}>
                Enable Push Alerts
              </Button>
            }
          >
            <strong>Push alerts are not active.</strong> Grant notification permissions to receive schedule reminders directly in your browser.
          </Alert>
        )}

        {notificationPermission === "denied" && (
          <Alert 
            severity="error" 
            icon={<NotificationsOffRounded />}
            sx={{ mb: 3.5, borderRadius: 3 }}
          >
            <strong>Push alerts are blocked.</strong> Please unlock notifications in your browser's site settings to receive reminders.
          </Alert>
        )}

        {notificationPermission === "granted" && !isSubscribed && (
          <Alert 
            severity="info" 
            sx={{ mb: 3.5, borderRadius: 3 }}
          >
            Push alerts are authorized. Connecting to subscription service...
          </Alert>
        )}

        {/* Action Controls */}
        {notifications.length > 0 && (
          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mb: 2 }}>
            {unreadCount > 0 && (
              <Button 
                size="small" 
                variant="outlined" 
                startIcon={<DoneAllRounded />} 
                onClick={handleMarkAllRead}
                disabled={actionLoading}
              >
                Mark all read
              </Button>
            )}
            <Button 
              size="small" 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteSweepRounded />} 
              onClick={handleClearHistory}
              disabled={actionLoading}
            >
              Clear history
            </Button>
          </Stack>
        )}

        {/* Notifications list card */}
        <Card component={motion.div} {...cardMotion} sx={{ borderRadius: 3, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)", border: "1px solid rgba(148, 163, 184, 0.12)" }}>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            {loading ? (
              <Box sx={{ p: 3 }}>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Box key={idx} sx={{ mb: 2.5 }}>
                    <Skeleton width="40%" height={24} />
                    <Skeleton width="85%" height={18} sx={{ mt: 0.5 }} />
                    {idx < 3 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 10, px: 3 }}>
                <NotificationsNoneRounded sx={{ fontSize: 56, color: "text.secondary", opacity: 0.7 }} />
                <Typography variant="h6" fontWeight={750} sx={{ mt: 2 }}>No notifications</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxW: 400, mx: "auto" }}>
                  Your notification history will build up here as reminders trigger for Gym, Hobbies, Goals, and Free Time.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {notifications.map((notif, index) => (
                  <Box key={notif._id}>
                    <ListItem 
                      button
                      onClick={() => handleItemClick(notif)}
                      sx={{ 
                        px: 3, 
                        py: 2, 
                        bgcolor: notif.read ? "transparent" : "action.hover",
                        borderLeft: `4px solid ${getCategoryColor(notif.category)}`,
                        transition: "background-color 0.2s",
                        "&:hover": {
                          bgcolor: notif.read ? "action.hover" : "action.selected"
                        }
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
                            <Typography fontWeight={notif.read ? 600 : 800} variant="body1">
                              {notif.title}
                            </Typography>
                            {!notif.read && (
                              <Chip label="New" color="primary" size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }} />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Box sx={{ mt: 0.75 }}>
                            <Typography variant="body2" color="text.primary">
                              {notif.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "inline-block" }}>
                              {new Date(notif.createdAt).toLocaleDateString()} • {notif.startTime} • Category: {notif.category?.replace("-", " ")}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
}

export default Notifications;
