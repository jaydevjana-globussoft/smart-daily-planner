import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Stack, 
  Button, 
  Switch, 
  FormControlLabel, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl, 
  Divider, 
  Alert,
  CircularProgress
} from "@mui/material";
import { 
  NotificationsRounded, 
  PsychologyRounded, 
  DarkModeRounded,
  CheckCircleRounded
} from "@mui/icons-material";
import axios from "axios";
import MainLayout from "../../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";

const cardMotion = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: "easeOut" } };
const cardSx = { borderRadius: 3, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)", border: "1px solid rgba(148, 163, 184, 0.12)", bgcolor: "background.paper" };

function Settings() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [minutesBefore, setMinutesBefore] = useState(15);
  const [motivationStyle, setMotivationStyle] = useState("Friendly");
  const [darkMode, setDarkMode] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/onboarding/status/${userId}`);
        if (data.success && data.user) {
          const user = data.user;
          if (user.reminderPreference) {
            setNotificationsEnabled(user.reminderPreference.enabled ?? true);
            setMinutesBefore(user.reminderPreference.minutesBefore ?? 15);
          }
          if (user.motivationStyle) {
            setMotivationStyle(user.motivationStyle);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load preferences.");
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();

    const isDark = localStorage.getItem("plannerDarkMode") === "true";
    setDarkMode(isDark);
  }, [userId, navigate]);

  const handleSaveSettings = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/onboarding/motivation-reminder`, {
        userId,
        motivationStyle,
        reminderPreference: {
          enabled: notificationsEnabled,
          minutesBefore
        }
      });

      if (data.success) {
        localStorage.setItem("userProfile", JSON.stringify(data.user));
        setSuccess("Settings updated and synchronized with database!");
      } else {
        throw new Error(data.message || "Failed to update settings");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTheme = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem("plannerDarkMode", String(nextDark));
    window.dispatchEvent(new Event("storage"));
    setSuccess(`Theme adjusted to ${nextDark ? "Dark" : "Light"} mode.`);
  };

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 800, mx: "auto", px: { xs: 1, sm: 2 } }}>
        
        {/* Title */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={850}>Settings</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Personalize your planner interface theme, motivation styles, and reminders.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card component={motion.div} {...cardMotion} sx={cardSx}>
            <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
              <Stack spacing={4}>
                
                {/* Notification Settings */}
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <NotificationsRounded color="primary" />
                    <Typography variant="h6" fontWeight={800}>Reminders & Alerts</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2.5 }} />

                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={notificationsEnabled} 
                          onChange={(e) => setNotificationsEnabled(e.target.checked)} 
                        />
                      }
                      label="Enable PWA reminder notifications"
                      slotProps={{ typography: { fontWeight: 650 } }}
                    />

                    {notificationsEnabled && (
                      <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel id="minutes-label" shrink>Reminder Time (minutes before)</InputLabel>
                        <Select
                          labelId="minutes-label"
                          value={minutesBefore}
                          onChange={(e) => setMinutesBefore(Number(e.target.value))}
                          label="Reminder Time (minutes before)"
                          notched
                        >
                          <MenuItem value={5}>5 minutes before</MenuItem>
                          <MenuItem value={10}>10 minutes before</MenuItem>
                          <MenuItem value={15}>15 minutes before</MenuItem>
                          <MenuItem value={20}>20 minutes before</MenuItem>
                          <MenuItem value={30}>30 minutes before</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  </Stack>
                </Box>

                {/* Coaching & Motivation Styles */}
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <PsychologyRounded color="primary" />
                    <Typography variant="h6" fontWeight={800}>Coaching Personality</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2.5 }} />

                  <FormControl fullWidth>
                    <InputLabel id="motivation-label" shrink>Motivation Style</InputLabel>
                    <Select
                      labelId="motivation-label"
                      value={motivationStyle}
                      onChange={(e) => setMotivationStyle(e.target.value)}
                      label="Motivation Style"
                      notched
                    >
                      <MenuItem value="Friendly">Friendly Coach (Empathetic and positive)</MenuItem>
                      <MenuItem value="Stern">Stern Instructor (Direct and highly structured)</MenuItem>
                      <MenuItem value="Action-oriented">Action Leader (Focuses on task results)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Theme Settings */}
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <DarkModeRounded color="primary" />
                    <Typography variant="h6" fontWeight={800}>Appearance</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2.5 }} />

                  <FormControlLabel
                    control={
                      <Switch 
                        checked={darkMode} 
                        onChange={handleToggleTheme} 
                      />
                    }
                    label="Enable Dark Mode styling theme"
                    slotProps={{ typography: { fontWeight: 650 } }}
                  />
                </Box>

                {/* Save Controls */}
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<CheckCircleRounded />}
                  onClick={handleSaveSettings}
                  disabled={saving}
                  sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
                >
                  {saving ? "Saving settings..." : "Save Preferences"}
                </Button>

              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>
    </MainLayout>
  );
}

export default Settings;
