import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Stack, 
  Divider, 
  Skeleton,
  Chip,
  Alert
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
  PolarAngleAxis
} from "recharts";
import { 
  TrendingUpRounded, 
  TimelineRounded, 
  PieChartRounded, 
  BarChartRounded,
  LocalFireDepartmentRounded,
  CheckCircleOutlineRounded
} from "@mui/icons-material";
import axios from "axios";
import MainLayout from "../../components/layout/MainLayout";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";
const PIE_COLORS = ["#2563eb", "#dc2626", "#16a34a", "#f97316", "#7c3aed"];

const cardMotion = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: "easeOut" } };
const cardSx = { borderRadius: 3, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)", border: "1px solid rgba(148, 163, 184, 0.12)", bgcolor: "background.paper" };

function Progress() {
  const userId = localStorage.getItem("userId");

  const { data: metricsData, isLoading, error } = useQuery({
    queryKey: ["dashboardMetrics", userId],
    queryFn: () => axios.get(`${API_BASE_URL}/dashboard/metrics/${userId}`).then(res => res.data),
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <MainLayout>
        <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
          <Skeleton width="30%" height={50} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={250} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={250} /></Grid>
          </Grid>
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Alert severity="error">Failed to load analytics: {error.message}</Alert>
      </MainLayout>
    );
  }

  const metrics = metricsData?.metrics || {};

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 1, sm: 2 } }}>
        
        {/* Title */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={850}>Analytics & Progress</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Visualize your productivity performance curves, monthly streaks, and goal progress.
          </Typography>
        </Box>

        {/* Top Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card component={motion.div} {...cardMotion} sx={cardSx}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <LocalFireDepartmentRounded color="error" sx={{ fontSize: 36 }} />
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={800}>STREAK</Typography>
                    <Typography variant="h4" fontWeight={900}>{metrics.streak || 0} Days</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card component={motion.div} {...cardMotion} sx={cardSx}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CheckCircleOutlineRounded color="success" sx={{ fontSize: 36 }} />
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={800}>WEEKLY COMPLETION RATE</Typography>
                    <Typography variant="h4" fontWeight={900}>{metrics.weeklyProgress || 0}%</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card component={motion.div} {...cardMotion} sx={cardSx}>
              <CardContent
                sx={{
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  gap: 0.5,
                }}
              >
                <TrendingUpRounded
                  color="primary"
                  sx={{ fontSize: 38, mb: 0.5 }}
                />
                <Typography
                  variant="overline"
                  color="text.secondary"
                  fontWeight={800}
                  sx={{ letterSpacing: 1, lineHeight: 1.3 }}
                >
                  CONSISTENCY INDEX
                </Typography>
                <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1.2 }}>
                  {metrics.weeklyProgress > 75
                    ? "Excellent"
                    : metrics.weeklyProgress > 50
                      ? "Steady"
                      : "Developing"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Grid */}
        <Grid container spacing={3.5}>
          {/* Weekly Performance Curve */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card component={motion.div} {...cardMotion} sx={cardSx}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <TimelineRounded color="primary" />
                  <Typography variant="h6" fontWeight={800}>Weekly Performance Curve</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <LineChart data={metrics.weeklyPerformance || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Activity Completion categories */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card component={motion.div} {...cardMotion} sx={cardSx}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <PieChartRounded color="primary" />
                  <Typography variant="h6" fontWeight={800}>Activity Completion breakdown</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={metrics.activityCompletion || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {(metrics.activityCompletion || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip formatter={(value) => `${value}%`} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Goal Progress Horizon */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card component={motion.div} {...cardMotion} sx={cardSx}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <BarChartRounded color="primary" />
                  <Typography variant="h6" fontWeight={800}>Goal Performance Analytics</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                
                {metrics.goalProgress && metrics.goalProgress.length > 0 ? (
                  <Box sx={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer>
                      <RadialBarChart 
                        cx="50%" cy="50%" 
                        innerRadius="30%" outerRadius="100%" 
                        barSize={12} 
                        data={(metrics.goalProgress || []).map((g, i) => ({ ...g, fill: PIE_COLORS[i % PIE_COLORS.length] }))}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={6} />
                        <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                        <ChartTooltip formatter={(value) => `${value}%`} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Typography color="text.secondary" sx={{ py: 6, textAlign: "center" }}>
                    No linked goal progress logs available.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Monthly Performance Week-by-Week */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card component={motion.div} {...cardMotion} sx={cardSx}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <BarChartRounded color="primary" />
                  <Typography variant="h6" fontWeight={800}>Monthly Performance Breakdown</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={metrics.monthlyPerformance || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                      <ChartTooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="rate" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
}

export default Progress;
