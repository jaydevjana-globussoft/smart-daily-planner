import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from "@mui/material";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";

function Fitness({ onNext, onBack, userId }) {
  const [formData, setFormData] = useState({
    isActive: true,
    frequency: "thrice-weekly",
    duration: 60,
    preferredTime: "evening",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => setFormData((previous) => ({ ...previous, [field]: value }));

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/onboarding/gym-schedule`, {
        userId,
        ...formData,
        duration: Number(formData.duration),
      });

      if (!data.success) throw new Error(data.message || "Failed to save fitness schedule");
      onNext();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Failed to save fitness schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box><Typography variant="h5" fontWeight={700}>Fitness schedule</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Add regular exercise to your daily routine.</Typography></Box>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField select label="Do you currently work out?" value={formData.isActive ? "yes" : "no"} onChange={(event) => updateField("isActive", event.target.value === "yes")}>
            <MenuItem value="yes">Yes</MenuItem><MenuItem value="no">No</MenuItem>
          </TextField>
          {formData.isActive && <>
            <TextField select label="Frequency" value={formData.frequency} onChange={(event) => updateField("frequency", event.target.value)}><MenuItem value="daily">Daily</MenuItem><MenuItem value="thrice-weekly">3 times a week</MenuItem><MenuItem value="twice-weekly">2 times a week</MenuItem><MenuItem value="weekly">Weekly</MenuItem></TextField>
            <TextField label="Workout duration (minutes)" type="number" value={formData.duration} onChange={(event) => updateField("duration", event.target.value)} inputProps={{ min: 15, max: 300 }} />
            <TextField select label="Preferred time" value={formData.preferredTime} onChange={(event) => updateField("preferredTime", event.target.value)}><MenuItem value="morning">Morning</MenuItem><MenuItem value="afternoon">Afternoon</MenuItem><MenuItem value="evening">Evening</MenuItem></TextField>
          </>}
          <Stack direction="row" spacing={2}><Button variant="outlined" onClick={onBack}>Back</Button><Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Next"}</Button></Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default Fitness;
