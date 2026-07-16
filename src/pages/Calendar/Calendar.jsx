import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Stack, 
  Grid, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Chip,
  IconButton
} from "@mui/material";
import { 
  CalendarMonthRounded, 
  ChevronLeftRounded, 
  ChevronRightRounded, 
  ScheduleRounded 
} from "@mui/icons-material";
import axios from "axios";
import MainLayout from "../../components/layout/MainLayout";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";
const categoryColors = { work: "#2563eb", gym: "#dc2626", hobby: "#16a34a", "personal-goal": "#f97316", break: "#7c3aed", sleep: "#475569" };

const formatTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  return Number.isNaN(hours) || Number.isNaN(minutes) 
    ? time 
    : new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes));
};

const cardMotion = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: "easeOut" } };
const cardSx = { borderRadius: 3, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)", border: "1px solid rgba(148, 163, 184, 0.12)", bgcolor: "background.paper" };

function Calendar() {
  const userId = localStorage.getItem("userId");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: todayData, isLoading } = useQuery({
    queryKey: ["currentTask", userId],
    queryFn: () => axios.get(`${API_BASE_URL}/dashboard/current-task/${userId}`).then(res => res.data),
    enabled: !!userId
  });

  const getCategoryColor = (category) => categoryColors[category] || "#64748b";

  // Generate calendar grid dates
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const days = [];

  // Previous month fallback dates
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthTotalDays - i),
      isCurrentMonth: false
    });
  }

  // Current month dates
  for (let i = 1; i <= totalDays; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    });
  }

  // Next month placeholder dates
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Mock schedule item preview generators for other days
  const getSelectedDayRoutine = () => {
    const isTodaySelected = isToday(selectedDate);
    if (isTodaySelected && todayData?.dailyRoutine) {
      return todayData.dailyRoutine;
    }

    // Return a mock schedule based on user's profile defaults for preview
    const day = selectedDate.getDay();
    const isWeekend = day === 0 || day === 6;

    if (isWeekend) {
      return [
        { taskName: "Sleep time", category: "sleep", startTime: "00:00", endTime: "08:00", status: "completed" },
        { taskName: "Breakfast & Rest", category: "break", startTime: "08:00", endTime: "09:30", status: "completed" },
        { taskName: "Free Time", category: "break", startTime: "09:30", endTime: "12:00", status: "completed" },
        { taskName: "Hobby Practice", category: "hobby", startTime: "14:00", endTime: "16:00", status: "completed" },
        { taskName: "Sleep time", category: "sleep", startTime: "22:00", endTime: "23:59", status: "completed" }
      ];
    } else {
      return [
        { taskName: "Sleep time", category: "sleep", startTime: "00:00", endTime: "07:00", status: "completed" },
        { taskName: "Morning Gym Routine", category: "gym", startTime: "07:00", endTime: "08:00", status: "completed" },
        { taskName: "Work schedule slot", category: "work", startTime: "09:00", endTime: "17:00", status: "completed" },
        { taskName: "Free Time", category: "break", startTime: "17:30", endTime: "19:00", status: "completed" },
        { taskName: "Sleep time", category: "sleep", startTime: "22:00", endTime: "23:59", status: "completed" }
      ];
    }
  };

  const selectedRoutine = getSelectedDayRoutine();

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 1, sm: 2 } }}>
        
        {/* Title */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={850}>Calendar Workspace</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Analyze your past schedule histories and preview upcoming days of the week.
          </Typography>
        </Box>

        <Grid container spacing={3.5}>
          {/* Monthly Calendar View */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card component={motion.div} {...cardMotion} sx={cardSx}>
              <CardContent sx={{ p: { xs: 2, sm: 3.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CalendarMonthRounded color="primary" />
                    <Typography variant="h6" fontWeight={800}>
                      {monthNames[month]} {year}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={handlePrevMonth}>
                      <ChevronLeftRounded />
                    </IconButton>
                    <IconButton size="small" onClick={handleNextMonth}>
                      <ChevronRightRounded />
                    </IconButton>
                  </Stack>
                </Stack>

                {/* Weekdays headers */}
                <Grid container spacing={0.5} sx={{ mb: 1, textAlign: "center" }}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                    <Grid key={dayName} size={1.71}>
                      <Typography variant="caption" fontWeight={800} color="text.secondary">
                        {dayName.toUpperCase()}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                {/* Days grid */}
                <Grid container spacing={0.5} sx={{ textAlign: "center" }}>
                  {days.map(({ date, isCurrentMonth }, idx) => {
                    const todayFlag = isToday(date);
                    const selectedFlag = isSelected(date);
                    return (
                      <Grid key={idx} size={1.71}>
                        <Box
                          onClick={() => setSelectedDate(date)}
                          sx={{
                            aspectRatio: "1/1",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "50%",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            color: isCurrentMonth ? "text.primary" : "text.disabled",
                            opacity: isCurrentMonth ? 1 : 0.45,
                            border: todayFlag ? "1.5px solid #10b981" : "none",
                            bgcolor: selectedFlag 
                              ? "primary.main" 
                              : todayFlag 
                                ? "rgba(16, 185, 129, 0.05)" 
                                : "transparent",
                            "&:hover": {
                              bgcolor: selectedFlag ? "primary.dark" : "action.hover"
                            }
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            fontWeight={selectedFlag || todayFlag ? 800 : 500}
                            color={selectedFlag ? "common.white" : "inherit"}
                          >
                            {date.getDate()}
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Day Detail Sidebar Panel */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card component={motion.div} {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.1 }} sx={{ ...cardSx, height: "100%" }}>
              <CardContent sx={{ p: 3.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={800}>
                    {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                  </Typography>
                  {isToday(selectedDate) ? (
                    <Chip label="Today" color="success" size="small" sx={{ fontWeight: 700 }} />
                  ) : (
                    <Chip label="Preview" color="primary" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                  )}
                </Stack>
                <Divider sx={{ mb: 2.5 }} />

                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <ScheduleRounded color="primary" />
                  <Typography variant="subtitle2" fontWeight={850} color="text.secondary">
                    DAILY SCHEDULE ROUTINE
                  </Typography>
                </Stack>

                <List disablePadding>
                  {selectedRoutine.map((task, index) => (
                    <ListItem 
                      key={index} 
                      divider={index < selectedRoutine.length - 1}
                      sx={{ 
                        px: 1.5, 
                        py: 1.25, 
                        mb: 1, 
                        borderRadius: 2, 
                        borderLeft: `5px solid ${getCategoryColor(task.category)}`,
                        bgcolor: "action.hover"
                      }}
                    >
                      <ListItemText 
                        primary={task.taskName} 
                        secondary={`${formatTime(task.startTime)} – ${formatTime(task.endTime)} • ${task.category?.replace("-", " ") || "other"}`}
                        primaryTypographyProps={{ fontSize: 13.5, fontWeight: 700 }}
                        secondaryTypographyProps={{ fontSize: 11.5 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
}

export default Calendar;