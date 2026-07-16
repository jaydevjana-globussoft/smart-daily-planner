import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
  LinearProgress,
  Divider,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import {
  AccessTimeRounded,
  LocalFireDepartmentRounded,
  LightbulbRounded,
  NotificationsRounded,
  AutoAwesomeRounded,
  TrendingUpRounded,
  CheckCircleOutlineRounded,
  ScheduleRounded,
  ArrowForwardRounded,
  CalendarTodayRounded,
  InsightsRounded,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";

/* ─────────────────────────────────────────────────────────────────── */
/*  Constants & Helpers                                                */
/* ─────────────────────────────────────────────────────────────────── */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";

const CATEGORY_COLORS = {
  work: "#2563eb",
  gym: "#dc2626",
  hobby: "#16a34a",
  "personal-goal": "#f97316",
  break: "#7c3aed",
  sleep: "#475569",
};

const PIE_COLORS = ["#8b5cf6", "#f97316", "#10b981", "#3b82f6", "#ec4899"];

const getCategoryColor = (cat) => CATEGORY_COLORS[cat] || "#64748b";

const formatTime = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  return Number.isNaN(h) || Number.isNaN(m)
    ? time
    : new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(2000, 0, 1, h, m));
};

const formatFreeTime = (mins) => {
  if (!mins || mins === 0) return "0 min";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
};

/* ── Glassmorphism card styles ── */
/* Alternating soft purple / soft orange tint per card index */
const GLASS_TINTS = [
  "linear-gradient(135deg, #F6F0FF 0%, #faf7ff 100%)",  // purple tint
  "linear-gradient(135deg, #FFF4E8 0%, #fffaf4 100%)",  // orange tint
  "linear-gradient(135deg, #F0F7FF 0%, #f5f9ff 100%)",  // blue tint
  "linear-gradient(135deg, #F0FFF8 0%, #f4fff9 100%)",  // mint tint
];

const glassSx = (idx = 0) => ({
  borderRadius: 3,
  background: GLASS_TINTS[idx % GLASS_TINTS.length],
  boxShadow: "0 2px 12px rgba(139,92,246,0.07), 0 1px 3px rgba(0,0,0,0.04)",
  border: "1px solid rgba(139,92,246,0.10)",
  backdropFilter: "blur(12px)",
  transition: "box-shadow 0.25s ease, transform 0.25s ease",
  "&:hover": {
    boxShadow: "0 8px 28px rgba(139,92,246,0.14), 0 2px 8px rgba(0,0,0,0.06)",
    transform: "translateY(-3px)",
  },
});

const stagger = (i) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut", delay: i * 0.055 },
});

/* ─────────────────────────────────────────────────────────────────── */
/*  Sub-components                                                     */
/* ─────────────────────────────────────────────────────────────────── */

function CountdownTimer({ endTime, onExpire }) {
  const [timeLeft, setTimeLeft] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!endTime) return undefined;
    const tick = () => {
      const [h, m] = endTime.split(":").map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        clearInterval(ref.current);
        onExpire?.();
        return;
      }
      const s = Math.floor(diff / 1000);
      setTimeLeft(
        `${String(Math.floor(s / 3600)).padStart(2, "0")}:` +
        `${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:` +
        `${String(s % 60).padStart(2, "0")}`
      );
    };
    tick();
    ref.current = setInterval(tick, 1000);
    return () => clearInterval(ref.current);
  }, [endTime, onExpire]);

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <AccessTimeRounded sx={{ color: "error.main", fontSize: 18 }} />
      <Typography
        variant="h6"
        fontWeight={800}
        color="error.main"
        fontFamily="monospace"
        letterSpacing={2}
      >
        {timeLeft || "00:00:00"}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        left
      </Typography>
    </Stack>
  );
}

function MetricCard({ icon, label, value, sub, progress, color, delay = 0, onClick, tintIdx = 0 }) {
  return (
    <Card
      component={motion.div}
      {...stagger(delay)}
      onClick={onClick}
      sx={{
        ...glassSx(tintIdx),
        cursor: onClick ? "pointer" : "default",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 3,
          bgcolor: color,
          borderRadius: "3px 3px 0 0",
        }}
      />
      <CardContent
        sx={{
          p: "20px !important",
          pt: "24px !important",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Avatar sx={{ bgcolor: `${color}22`, color, width: 48, height: 48, mb: 1.25 }}>
          {icon}
        </Avatar>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          sx={{ textTransform: "uppercase", letterSpacing: 1, fontSize: 10.5, display: "block" }}
        >
          {label}
        </Typography>
        <Typography
          variant="h3"
          fontWeight={900}
          sx={{ lineHeight: 1.05, mt: 0.5, mb: 0.5, fontSize: { xs: "1.75rem", sm: "2.1rem" } }}
        >
          {value}
        </Typography>
        {progress !== undefined && (
          <LinearProgress
            variant="determinate"
            value={progress}
            color="success"
            sx={{ width: "80%", height: 5, borderRadius: 3, mb: 0.75, bgcolor: "rgba(16,185,129,0.12)" }}
          />
        )}
        {sub && (
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: 11 }}>
            {sub}
          </Typography>
        )}
        {onClick && (
          <ArrowForwardRounded sx={{ fontSize: 14, color: "text.secondary", mt: 0.5, opacity: 0.6 }} />
        )}
      </CardContent>
    </Card>
  );
}

function CardHeader({ icon, title, subtitle }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
        <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
      </Stack>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: "block" }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

function EmptyChart({ message }) {
  return (
    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1 }}>
      <InsightsRounded sx={{ fontSize: 38, opacity: 0.25 }} />
      <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.5 }}>{message}</Typography>
    </Box>
  );
}

function DashboardSkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={90} sx={{ borderRadius: 3 }} />
      <Grid container spacing={2}>
        {[...Array(4)].map((_, i) => (
          <Grid key={i} size={{ xs: 6, md: 3 }}>
            <Skeleton variant="rounded" height={130} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
      <Skeleton variant="rounded" height={90} sx={{ borderRadius: 3 }} />
      <Grid container spacing={2}>
        {[...Array(6)].map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Skeleton variant="rounded" height={260} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Main Dashboard                                                     */
/* ─────────────────────────────────────────────────────────────────── */

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "there";
  const [completingIndex, setCompletingIndex] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) navigate("/login", { replace: true });
  }, [userId, navigate]);

  /* ── Queries (logic unchanged) ── */
  const { data: todayData, isLoading: scheduleLoading } = useQuery({
    queryKey: ["currentTask", userId],
    queryFn: () => axios.get(`${API_BASE_URL}/dashboard/current-task/${userId}`).then((r) => r.data),
    refetchInterval: 60000,
    enabled: !!userId,
  });

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboardMetrics", userId],
    queryFn: () => axios.get(`${API_BASE_URL}/dashboard/metrics/${userId}`).then((r) => r.data),
    refetchInterval: 60000,
    enabled: !!userId,
  });

  const { data: coachingData, isLoading: coachingLoading } = useQuery({
    queryKey: ["dashboardCoaching", userId],
    queryFn: () => axios.get(`${API_BASE_URL}/dashboard/ai-coaching/${userId}`).then((r) => r.data),
    refetchInterval: 60000,
    enabled: !!userId,
  });

  const { data: notifData } = useQuery({
    queryKey: ["notificationsCount", userId],
    queryFn: () => axios.get(`${API_BASE_URL}/notifications/history/${userId}`).then((r) => r.data),
    refetchInterval: 60000,
    enabled: !!userId,
  });

  /* ── Mutation (logic unchanged) ── */
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskIndex, status }) =>
      axios.post(`${API_BASE_URL}/dashboard/mark-complete`, {
        userId,
        scheduleId: todayData?.scheduleId,
        taskIndex,
        status,
      }),
    onMutate: ({ taskIndex }) => setCompletingIndex(taskIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentTask", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboardCoaching", userId] });
    },
    onError: (err) => setError(err.response?.data?.message || err.message || "Failed to update task."),
    onSettled: () => setCompletingIndex(null),
  });

  const handleUpdateTaskStatus = (taskIndex, status) => {
    setError("");
    updateTaskMutation.mutate({ taskIndex, status });
  };

  const handleTimerExpired = () =>
    queryClient.invalidateQueries({ queryKey: ["currentTask", userId] });

  /* ── Derived values (logic unchanged) ── */
  const loading = scheduleLoading || metricsLoading || coachingLoading;

  if (!userId) return null;
  if (loading) return <MainLayout><DashboardSkeleton /></MainLayout>;

  const { currentTask, nextTask, dailyRoutine, motivationalMessage } = todayData || {};
  const metrics = metricsData?.metrics || {};
  const coaching = coachingData?.coaching || {};
  const unreadCount = notifData?.notifications?.filter((n) => !n.read).length || 0;

  const activeItems = dailyRoutine?.filter((i) => i.category !== "sleep") || [];
  const completedItems = activeItems.filter((i) => i.isCompleted);
  const freeTimeItems = dailyRoutine?.filter((i) => i.taskName === "Free Time") || [];
  const totalFreeMinutes = freeTimeItems.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  /* ── Render ── */
  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1440, mx: "auto" }}>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════ ROW 1 — Welcome Banner ══════ */}
        <Box
          component={motion.div}
          {...stagger(0)}
          sx={{
            mb: 2,
            px: { xs: 2.5, sm: 3.5 },
            py: { xs: 2, sm: 2.5 },
            borderRadius: 3,
            background: "linear-gradient(118deg, #1e40af 0%, #4f46e5 50%, #7c3aed 100%)",
            boxShadow: "0 10px 32px rgba(79,70,229,0.22)",
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={850} color="white"
              sx={{ fontSize: { xs: "1.45rem", sm: "1.9rem" }, lineHeight: 1.15 }}>
              Good {greeting}, {userName}!
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.75 }}>
              <CalendarTodayRounded sx={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }} />
              <Typography sx={{ color: "rgba(255,255,255,0.82)", fontSize: 13.5, fontWeight: 500 }}>
                {today}
              </Typography>
              <Chip
                label={`${completedItems.length} / ${activeItems.length} done`}
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 700, fontSize: 11, backdropFilter: "blur(4px)" }}
              />
            </Stack>
          </Box>
          {activeItems.length > 0 && (
            <LinearProgress
              variant="determinate"
              value={activeItems.length > 0 ? Math.round((completedItems.length / activeItems.length) * 100) : 0}
              sx={{
                width: { xs: "100%", sm: 200 },
                height: 7,
                borderRadius: 4,
                bgcolor: "rgba(255,255,255,0.2)",
                "& .MuiLinearProgress-bar": { bgcolor: "white", borderRadius: 4 },
              }}
            />
          )}
        </Box>

        {/* ══════ ROW 2 — Motivation Quote ══════ */}
        <AnimatePresence>
          {motivationalMessage && (
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              sx={{
                mb: 2,
                px: 2.5,
                py: 1.5,
                borderRadius: 2.5,
                background: "linear-gradient(135deg, #F6F0FF 0%, #FFF4E8 100%)",
                border: "1px solid rgba(139,92,246,0.14)",
                borderLeft: "4px solid #8b5cf6",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <LightbulbRounded sx={{ color: "#f59e0b", fontSize: 20, flexShrink: 0 }} />
              <Typography variant="body2" fontWeight={600}
                sx={{ fontStyle: "italic", color: "text.primary", lineHeight: 1.55 }}>
                {motivationalMessage}
              </Typography>
            </Box>
          )}
        </AnimatePresence>

        {/* ══════ ROW 3 — 4 Metric Cards ══════ */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricCard delay={0} tintIdx={0} icon={<LocalFireDepartmentRounded fontSize="small" />}
              label="Monthly Streak" color="#ef4444"
              value={`${metrics.streak || 0}`} sub="consecutive days" />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricCard delay={1} tintIdx={1} icon={<TrendingUpRounded fontSize="small" />}
              label="Weekly Progress" color="#10b981"
              value={`${metrics.weeklyProgress || 0}%`}
              progress={metrics.weeklyProgress || 0} sub="completion rate" />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricCard delay={2} tintIdx={2} icon={<AccessTimeRounded fontSize="small" />}
              label="Free Time Today" color="#7c3aed"
              value={formatFreeTime(totalFreeMinutes)} sub="unscheduled time" />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricCard delay={3} tintIdx={3} icon={<NotificationsRounded fontSize="small" />}
              label="Notifications" color="#3b82f6"
              value={unreadCount} sub="unread alerts"
              onClick={() => navigate("/notifications")} />
          </Grid>
        </Grid>

        {/* ══════ ROW 4 — AI Coaching (full-width) ══════ */}
        <Card
          component={motion.div}
          {...stagger(4)}
          sx={{ ...glassSx(0), mb: 2, borderLeft: "4px solid #10b981" }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={{ xs: 2, md: 3 }}
              divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
                <Avatar sx={{ bgcolor: "rgba(16,185,129,0.12)", color: "#10b981", width: 40, height: 40 }}>
                  <AutoAwesomeRounded fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>AI Coach</Typography>
                  <Typography variant="caption" color="text.secondary">Weekly insights</Typography>
                </Box>
              </Stack>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ fontSize: 10 }}>
                  Habit Analysis
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                  {coaching.habitAnalysis || "Analyzing your activity patterns…"}
                </Typography>
              </Box>

              <Box sx={{ flex: 1.2, minWidth: 0 }}>
                <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ fontSize: 10 }}>
                  Improvements
                </Typography>
                {coaching.suggestions?.length > 0 ? (
                  <Stack spacing={0.4} sx={{ mt: 0.5 }}>
                    {coaching.suggestions.slice(0, 3).map((s, i) => (
                      <Typography key={i} variant="body2" sx={{ color: "primary.main", fontWeight: 600, lineHeight: 1.5 }}>
                        💡 {s}
                      </Typography>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>No suggestions right now.</Typography>
                )}
              </Box>

              <Box sx={{
                flex: 1, minWidth: 0,
                bgcolor: "rgba(79,70,229,0.05)", borderRadius: 2,
                px: 2, py: 1.25, border: "1px solid rgba(79,70,229,0.08)",
                alignSelf: "flex-start",
              }}>
                <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ fontSize: 10 }}>
                  Coaching
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontStyle: "italic", lineHeight: 1.6 }}>
                  "{coaching.coachingMessage || "Consistency builds progress step-by-step!"}"
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* ══════ ROW 5 — Masonry-style auto grid ══════
            Cards auto-size to content. No forced height stretching.
            Uses CSS columns on large screens, Grid on smaller.
        ══════════════════════════════════════════════════ */}
        <Grid container spacing={2} sx={{ alignItems: "start" }}>

          {/* ── Current Activity ── */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card component={motion.div} {...stagger(5)} sx={{ ...glassSx(0), overflow: "hidden" }}>
              <Box sx={{
                height: 4,
                background: currentTask
                  ? `linear-gradient(90deg, ${getCategoryColor(currentTask.category)}, ${getCategoryColor(currentTask.category)}66)`
                  : "linear-gradient(90deg, #cbd5e1, #e2e8f0)",
              }} />
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ fontSize: 10, letterSpacing: 1 }}>
                  Now Playing
                </Typography>
                {currentTask ? (
                  <>
                    <Typography variant="h5" fontWeight={850} sx={{ mt: 0.75, lineHeight: 1.2 }} noWrap>
                      {currentTask.taskName}
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                      <Chip
                        label={`${formatTime(currentTask.startTime)} – ${formatTime(currentTask.endTime)}`}
                        size="small" variant="outlined"
                        icon={<ScheduleRounded sx={{ fontSize: "13px !important" }} />}
                      />
                      <Chip
                        label={currentTask.category?.replace("-", " ") || "other"}
                        size="small"
                        sx={{ bgcolor: getCategoryColor(currentTask.category), color: "white", fontWeight: 700, textTransform: "capitalize" }}
                      />
                    </Stack>
                    <Box sx={{ mt: 1.5 }}>
                      <CountdownTimer endTime={currentTask.endTime} onExpire={handleTimerExpired} />
                    </Box>
                  </>
                ) : (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="h6" color="text.secondary" fontWeight={700}>No active task</Typography>
                    <Typography variant="body2" color="text.secondary">Enjoy your free moment!</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* ── Next Activity ── */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card component={motion.div} {...stagger(6)} sx={{ ...glassSx(1), overflow: "hidden" }}>
              <Box sx={{ height: 4, bgcolor: nextTask ? getCategoryColor(nextTask.category) : "#e2e8f0" }} />
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ fontSize: 10, letterSpacing: 1 }}>
                  Up Next
                </Typography>
                {nextTask ? (
                  <>
                    <Typography variant="h6" fontWeight={800} sx={{ mt: 0.75 }} noWrap>
                      {nextTask.taskName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
                      {formatTime(nextTask.startTime)} – {formatTime(nextTask.endTime)}
                    </Typography>
                    <Chip
                      label={nextTask.category?.replace("-", " ") || "other"}
                      size="small"
                      sx={{ mt: 1.25, bgcolor: getCategoryColor(nextTask.category), color: "white", fontWeight: 700, textTransform: "capitalize" }}
                    />
                  </>
                ) : (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body1" fontWeight={700} color="text.secondary">Nothing next</Typography>
                    <Typography variant="body2" color="text.secondary">You're done for today! 🎉</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* ── Activity Completion Pie ── */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card component={motion.div} {...stagger(7)} sx={glassSx(2)}>
              <CardContent sx={{ p: 2.5 }}>
                <CardHeader
                  icon={<CheckCircleOutlineRounded sx={{ fontSize: 18 }} />}
                  title="Activity Completion"
                  subtitle="Category-wise rates"
                />
                <Box sx={{ width: "100%", height: 220 }}>
                  {metrics.activityCompletion?.some((c) => c.value > 0) ? (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={metrics.activityCompletion} cx="50%" cy="50%"
                          innerRadius={58} outerRadius={82} paddingAngle={3} dataKey="value">
                          {metrics.activityCompletion.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip formatter={(v) => [`${v}%`, "Completion"]} />
                        <Legend verticalAlign="bottom" height={28} iconType="circle" iconSize={8}
                          wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart message="No completion data yet" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* ── Today's Timeline ── (auto-height, no fixed maxHeight stretch) */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card component={motion.div} {...stagger(8)} sx={glassSx(3)}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <ScheduleRounded color="primary" sx={{ fontSize: 19 }} />
                    <Typography variant="h6" fontWeight={800}>Today's Timeline</Typography>
                  </Stack>
                  <Chip
                    label={`${completedItems.length} / ${activeItems.length}`}
                    color="primary" variant="outlined" size="small" sx={{ fontWeight: 700 }}
                  />
                </Stack>
                <Divider sx={{ mb: 1.5 }} />

                {!dailyRoutine?.length ? (
                  <Box sx={{ textAlign: "center", py: 5 }}>
                    <CalendarTodayRounded sx={{ fontSize: 38, color: "text.secondary", opacity: 0.35 }} />
                    <Typography color="text.secondary" fontWeight={600} sx={{ mt: 1 }}>No schedule yet</Typography>
                    <Typography variant="body2" color="text.secondary">Complete onboarding to generate your routine.</Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {dailyRoutine.map((task, index) => (
                      <ListItem
                        key={task._id || `${task.taskName}-${index}`}
                        divider={index < dailyRoutine.length - 1}
                        secondaryAction={
                          task.status === "planned" && task.category !== "sleep" && (
                            <Stack direction="row" spacing={0.75}>
                              <Tooltip title="Mark complete">
                                <span>
                                  <Button size="small" variant="contained"
                                    onClick={() => handleUpdateTaskStatus(index, "completed")}
                                    disabled={completingIndex === index}
                                    sx={{ minWidth: 0, px: 1.5, py: 0.5, fontSize: 12, fontWeight: 700, textTransform: "none" }}>
                                    {completingIndex === index ? "…" : "Done"}
                                  </Button>
                                </span>
                              </Tooltip>
                              <Tooltip title="Skip">
                                <span>
                                  <Button size="small" variant="outlined" color="error"
                                    onClick={() => handleUpdateTaskStatus(index, "skipped")}
                                    disabled={completingIndex === index}
                                    sx={{ minWidth: 0, px: 1.5, py: 0.5, fontSize: 12, fontWeight: 700, textTransform: "none" }}>
                                    Skip
                                  </Button>
                                </span>
                              </Tooltip>
                            </Stack>
                          )
                        }
                        sx={{
                          px: 1.25, py: 0.9,
                          borderRadius: 1.5, mb: 0.5,
                          borderLeft: `4px solid ${getCategoryColor(task.category)}`,
                          bgcolor: task.isCompleted
                            ? "rgba(34,197,94,0.06)"
                            : task.isSkipped
                              ? "rgba(239,68,68,0.05)"
                              : "rgba(255,255,255,0.5)",
                          transition: "background-color 0.2s",
                        }}
                      >
                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: getCategoryColor(task.category), mr: 1.5, flexShrink: 0 }} />
                        <ListItemText
                          primary={task.taskName}
                          secondary={`${formatTime(task.startTime)} – ${formatTime(task.endTime)} · ${task.category?.replace("-", " ") || "other"}`}
                          slotProps={{
                            primary: {
                              sx: {
                                fontWeight: 700, fontSize: 13.5,
                                textDecoration: task.isCompleted || task.isSkipped ? "line-through" : "none",
                                color: task.isSkipped ? "text.secondary" : "text.primary",
                              },
                            },
                            secondary: { sx: { fontSize: 11.5, textTransform: "capitalize" } },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* ── Weekly Performance ── */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card component={motion.div} {...stagger(9)} sx={glassSx(1)}>
              <CardContent sx={{ p: 2.5 }}>
                <CardHeader
                  icon={<TrendingUpRounded sx={{ fontSize: 18 }} />}
                  title="Weekly Performance"
                  subtitle="Daily rates — last 7 days"
                />
                <Box sx={{ width: "100%", height: 200 }}>
                  {metrics.weeklyPerformance?.length > 0 ? (
                    <ResponsiveContainer>
                      <LineChart data={metrics.weeklyPerformance} margin={{ top: 4, right: 6, left: -24, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <ChartTooltip />
                        <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                        <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="notCompleted" name="Not Completed" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3, fill: "#ef4444" }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="pending" name="Pending" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: "#8b5cf6" }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart message="No performance data yet" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* ── Goal Progress ── */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card component={motion.div} {...stagger(10)} sx={glassSx(0)}>
              <CardContent sx={{ p: 2.5 }}>
                <CardHeader
                  icon={<InsightsRounded sx={{ fontSize: 18 }} />}
                  title="Goal Progress"
                  subtitle="Completion per goal"
                />
                <Box sx={{ width: "100%", height: 200 }}>
                  {metrics.goalProgress?.length > 0 ? (
                    <ResponsiveContainer>
                      <RadialBarChart 
                        cx="50%" cy="50%" 
                        innerRadius="30%" outerRadius="100%" 
                        barSize={12} 
                        data={metrics.goalProgress.map((g, i) => ({ ...g, fill: PIE_COLORS[i % PIE_COLORS.length] }))}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={6} />
                        <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                        <ChartTooltip formatter={(value) => `${value}%`} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart message="Add goals to see progress" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* ── Monthly Performance ── */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card component={motion.div} {...stagger(11)} sx={glassSx(3)}>
              <CardContent sx={{ p: 2.5 }}>
                <CardHeader
                  icon={<InsightsRounded sx={{ fontSize: 18 }} />}
                  title="Monthly Performance"
                  subtitle="Week-by-week last 4 weeks"
                />
                <Box sx={{ width: "100%", height: 200 }}>
                  {metrics.monthlyPerformance?.length > 0 ? (
                    <ResponsiveContainer>
                      <BarChart data={metrics.monthlyPerformance} margin={{ top: 4, right: 6, left: -24, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <ChartTooltip formatter={(v) => [`${v}%`, "Rate"]} />
                        <Bar dataKey="rate" radius={[4, 4, 0, 0]} barSize={34}>
                          {metrics.monthlyPerformance.map((entry, i) => (
                            <Cell key={i} fill={entry.rate > 70 ? "#f97316" : "#fdba74"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart message="No monthly data yet" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Box>
    </MainLayout>
  );
}

export default Dashboard;
