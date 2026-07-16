import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Checkbox, FormControlLabel, FormGroup, Stack, Typography } from "@mui/material";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";
const goalOptions = ["Build Muscle", "Lose Weight", "Improve Fitness", "Read More Books", "Reduce Stress", "Learn Programming", "Improve Productivity"];

function Goals({ onNext, onBack, userId }) {
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toggleGoal = (goal) => setSelectedGoals((previous) => previous.includes(goal) ? previous.filter((item) => item !== goal) : [...previous, goal]);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/onboarding/personal-goals`, { userId, personalGoals: selectedGoals.map((goal) => ({ goal, priority: "medium", frequency: "weekly" })) });
      if (!data.success) throw new Error(data.message || "Failed to save personal goals");
      onNext();
    } catch (requestError) { setError(requestError.response?.data?.message || requestError.message || "Failed to save personal goals"); }
    finally { setLoading(false); }
  };

  return <Card sx={{ borderRadius: 2 }}><CardContent sx={{ p: 4 }}><Stack spacing={3}>
    <Box><Typography variant="h5" fontWeight={700}>Personal goals</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Select goals for your plan.</Typography></Box>
    {error && <Alert severity="error">{error}</Alert>}
    <FormGroup>{goalOptions.map((goal) => <FormControlLabel key={goal} label={goal} control={<Checkbox checked={selectedGoals.includes(goal)} onChange={() => toggleGoal(goal)} />} />)}</FormGroup>
    <Stack direction="row" spacing={2}><Button variant="outlined" onClick={onBack}>Back</Button><Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Next"}</Button></Stack>
  </Stack></CardContent></Card>;
}

export default Goals;
