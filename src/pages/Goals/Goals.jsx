import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Stack, 
  TextField, 
  Button, 
  Grid, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Chip, 
  Alert,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  IconButton,
  CircularProgress
} from "@mui/material";
import { 
  FlagRounded, 
  AddRounded, 
  CheckCircleRounded, 
  DeleteSweepRounded 
} from "@mui/icons-material";
import axios from "axios";
import MainLayout from "../../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";

const priorityColors = {
  high: "error",
  medium: "warning",
  low: "info"
};

const cardMotion = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: "easeOut" } };
const cardSx = { borderRadius: 3, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)", border: "1px solid rgba(148, 163, 184, 0.12)", bgcolor: "background.paper" };

function Goals() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [priority, setPriority] = useState("medium");
  const [frequency, setFrequency] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchGoals = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/onboarding/status/${userId}`);
        if (data.success && data.user && data.user.personalGoals) {
          setGoals(data.user.personalGoals);
        } else {
          setGoals([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch goals from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [userId, navigate]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;

    setError("");
    setSuccess("");
    setSaving(true);

    const updatedGoals = [...goals, { goal: newGoal.trim(), priority, frequency }];

    try {
      const { data } = await axios.post(`${API_BASE_URL}/onboarding/personal-goals`, {
        userId,
        personalGoals: updatedGoals
      });

      if (data.success) {
        setGoals(updatedGoals);
        localStorage.setItem("userProfile", JSON.stringify(data.user));
        setNewGoal("");
        setPriority("medium");
        setFrequency("daily");
        setSuccess("Goal added successfully and synchronized with your profile!");
      } else {
        throw new Error(data.message || "Failed to add goal");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to sync goals with server.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (indexToDelete) => {
    setError("");
    setSuccess("");
    const updatedGoals = goals.filter((_, idx) => idx !== indexToDelete);
    setSaving(true);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/onboarding/personal-goals`, {
        userId,
        personalGoals: updatedGoals
      });

      if (data.success) {
        setGoals(updatedGoals);
        localStorage.setItem("userProfile", JSON.stringify(data.user));
        setSuccess("Goal deleted and synchronized with your profile.");
      } else {
        throw new Error(data.message || "Failed to delete goal");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete goal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 1, sm: 2 } }}>
        
        {/* Title */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={850}>Personal Goals</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Focus on what matters most. Map out tasks that progress your personal goals.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3.5}>
            {/* Active Goals List */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card component={motion.div} {...cardMotion} sx={cardSx}>
                <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <FlagRounded color="primary" />
                    <Typography variant="h6" fontWeight={800}>Active Goals</Typography>
                  </Stack>
                  <Divider sx={{ mb: 3 }} />

                  {goals.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                      <Typography variant="h6" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                        No goals active
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create your first goal using the panel on the right.
                      </Typography>
                    </Box>
                  ) : (
                    <List disablePadding>
                      {goals.map((item, idx) => (
                        <ListItem 
                          key={idx} 
                          divider={idx < goals.length - 1}
                          secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteGoal(idx)} disabled={saving}>
                              <DeleteSweepRounded color="error" />
                            </IconButton>
                          }
                          sx={{ py: 2, px: 1 }}
                        >
                          <ListItemText 
                            primary={item.goal} 
                            secondary={`Priority: ${item.priority} • Target: ${item.frequency}`}
                            primaryTypographyProps={{ fontWeight: 750, color: "text.primary" }}
                            secondaryTypographyProps={{ sx: { textTransform: "capitalize", mt: 0.5 } }}
                          />
                          <Stack direction="row" spacing={1} sx={{ mr: 4 }}>
                            <Chip 
                              label={item.priority} 
                              color={priorityColors[item.priority?.toLowerCase()] || "default"}
                              size="small" 
                              sx={{ fontWeight: 700, textTransform: "capitalize" }} 
                            />
                            <Chip 
                              label={item.frequency} 
                              variant="outlined"
                              size="small" 
                              sx={{ fontWeight: 700, textTransform: "capitalize" }} 
                            />
                          </Stack>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Add Goal Panel */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card component={motion.div} {...cardMotion} transition={{ ...cardMotion.transition, delay: 0.1 }} sx={cardSx}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                    <AddRounded color="primary" />
                    <Typography variant="h6" fontWeight={850}>Define New Goal</Typography>
                  </Stack>
                  <Divider sx={{ mb: 3 }} />

                  <Box component="form" onSubmit={handleAddGoal}>
                    <Stack spacing={3}>
                      <TextField 
                        label="Goal Title" 
                        variant="outlined" 
                        fullWidth 
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="e.g. Learn System Architecture"
                        required
                        slotProps={{ inputLabel: { shrink: true } }}
                      />

                      <FormControl fullWidth>
                        <InputLabel id="priority-label" shrink>Priority Level</InputLabel>
                        <Select
                          labelId="priority-label"
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          label="Priority Level"
                          notched
                        >
                          <MenuItem value="high">High Priority</MenuItem>
                          <MenuItem value="medium">Medium Priority</MenuItem>
                          <MenuItem value="low">Low Priority</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <InputLabel id="frequency-label" shrink>Target Frequency</InputLabel>
                        <Select
                          labelId="frequency-label"
                          value={frequency}
                          onChange={(e) => setFrequency(e.target.value)}
                          label="Target Frequency"
                          notched
                        >
                          <MenuItem value="daily">Daily Target</MenuItem>
                          <MenuItem value="weekly">Weekly Target</MenuItem>
                          <MenuItem value="monthly">Monthly Target</MenuItem>
                        </Select>
                      </FormControl>

                      <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        startIcon={<CheckCircleRounded />}
                        fullWidth
                        disabled={saving || !newGoal.trim()}
                        sx={{ py: 1.25, fontWeight: 700 }}
                      >
                        {saving ? "Saving Goal..." : "Save Goal"}
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </MainLayout>
  );
}

export default Goals;
