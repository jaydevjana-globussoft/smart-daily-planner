import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Stack, 
  Chip, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Alert, 
  Skeleton,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import { 
  ScheduleRounded, 
  CheckCircleOutlineRounded, 
  FilterListRounded, 
  CloseRounded 
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

function Schedule() {
  const queryClient = useQueryClient();
  const userId = localStorage.getItem("userId");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [completingIndex, setCompletingIndex] = useState(null);
  const [error, setError] = useState("");

  const { data: todayData, isLoading, refetch } = useQuery({
    queryKey: ["currentTask", userId],
    queryFn: () => axios.get(`${API_BASE_URL}/dashboard/current-task/${userId}`).then(res => res.data),
    enabled: !!userId
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskIndex, status }) => {
      return axios.post(`${API_BASE_URL}/dashboard/mark-complete`, {
        userId,
        scheduleId: todayData?.scheduleId,
        taskIndex,
        status
      });
    },
    onMutate: ({ taskIndex }) => {
      setCompletingIndex(taskIndex);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentTask", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics", userId] });
    },
    onError: (err) => {
      setError(err.response?.data?.message || err.message || "Failed to update task status.");
    },
    onSettled: () => {
      setCompletingIndex(null);
    }
  });

  const handleUpdateTaskStatus = (taskIndex, status) => {
    setError("");
    updateTaskMutation.mutate({ taskIndex, status });
  };

  const getCategoryColor = (category) => categoryColors[category] || "#64748b";

  if (isLoading) {
    return (
      <MainLayout>
        <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
          <Skeleton width="40%" height={50} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
        </Box>
      </MainLayout>
    );
  }

  const { dailyRoutine } = todayData || {};
  const activeItems = dailyRoutine?.filter(i => i.category !== "sleep") || [];
  const completedItems = activeItems.filter(i => i.isCompleted);

  const filteredRoutine = dailyRoutine?.filter(item => {
    if (categoryFilter === "all") return true;
    return item.category?.toLowerCase() === categoryFilter.toLowerCase();
  }) || [];

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 1, sm: 2 } }}>
        
        {/* Title Block */}
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={850}>Today's Schedule</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Track, adjust, and complete your planned daily routine items.
            </Typography>
          </Box>
          <Chip 
            label={`${completedItems.length}/${activeItems.length} Tasks Completed`} 
            color="primary" 
            variant="outlined" 
            sx={{ fontWeight: 700, fontSize: "0.85rem", py: 1.8 }}
          />
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Filters Group */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3, overflowX: "auto", pb: 1 }}>
          <FilterListRounded sx={{ color: "text.secondary" }} />
          <ToggleButtonGroup
            size="small"
            value={categoryFilter}
            exclusive
            onChange={(_, val) => val && setCategoryFilter(val)}
            aria-label="schedule filter"
          >
            <ToggleButton value="all" sx={{ textTransform: "none", fontWeight: 700 }}>All</ToggleButton>
            <ToggleButton value="work" sx={{ textTransform: "none", fontWeight: 700 }}>Work</ToggleButton>
            <ToggleButton value="gym" sx={{ textTransform: "none", fontWeight: 700 }}>Gym</ToggleButton>
            <ToggleButton value="hobby" sx={{ textTransform: "none", fontWeight: 700 }}>Hobbies</ToggleButton>
            <ToggleButton value="personal-goal" sx={{ textTransform: "none", fontWeight: 700 }}>Goals</ToggleButton>
            <ToggleButton value="break" sx={{ textTransform: "none", fontWeight: 700 }}>Breaks</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* Timeline Card */}
        <Card component={motion.div} {...cardMotion} sx={cardSx}>
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <ScheduleRounded color="primary" />
              <Typography variant="h6" fontWeight={800}>Schedule Timeline</Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />

            {filteredRoutine.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography color="text.secondary">No items found for the selected filter.</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {filteredRoutine.map((task, index) => {
                  const originalIndex = dailyRoutine.findIndex(item => item._id === task._id);
                  return (
                    <ListItem 
                      key={task._id || `${task.taskName}-${task.startTime}-${index}`} 
                      divider={index < filteredRoutine.length - 1}
                      secondaryAction={
                        task.status === "planned" && task.category !== "sleep" && (
                          <Stack direction="row" spacing={1}>
                            <Button 
                              size="small" 
                              color="primary" 
                              variant="contained" 
                              onClick={() => handleUpdateTaskStatus(originalIndex, "completed")} 
                              disabled={completingIndex === originalIndex}
                            >
                              {completingIndex === originalIndex ? "..." : "Complete"}
                            </Button>
                            <Button 
                              size="small" 
                              color="error" 
                              variant="outlined" 
                              onClick={() => handleUpdateTaskStatus(originalIndex, "skipped")} 
                              disabled={completingIndex === originalIndex}
                            >
                              Skip
                            </Button>
                          </Stack>
                        )
                      } 
                      sx={{ 
                        px: 2, 
                        py: 2, 
                        mb: 1.5, 
                        borderRadius: 2, 
                        borderLeft: `6px solid ${getCategoryColor(task.category)}`, 
                        bgcolor: task.isCompleted 
                          ? "rgba(34, 197, 94, 0.08)" 
                          : task.isSkipped 
                            ? "rgba(239, 68, 68, 0.08)" 
                            : "transparent",
                        transition: "background-color 0.2s"
                      }}
                    >
                      <ListItemText 
                        primary={task.taskName} 
                        secondary={`${formatTime(task.startTime)} – ${formatTime(task.endTime)} • ${task.category?.replace("-", " ") || "other"}`} 
                        slotProps={{ 
                          primary: { 
                            sx: { 
                              fontWeight: 750, 
                              fontSize: "1.05rem",
                              textDecoration: task.isCompleted ? "line-through" : task.isSkipped ? "line-through text.secondary" : "none", 
                              color: task.isSkipped ? "text.secondary" : "text.primary" 
                            } 
                          } 
                        }} 
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
}

export default Schedule;