import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, FormControlLabel, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";

function Reminder({ onNext, onBack, motivationStyle, userId }) {
  const [minutesBefore, setMinutesBefore] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/onboarding/motivation-reminder`, { userId, motivationStyle, reminderPreference: { enabled: true, minutesBefore: Number(minutesBefore), notificationType: "push" } });
      if (!data.success) throw new Error(data.message || "Failed to save reminder preference");
      onNext();
    } catch (requestError) { setError(requestError.response?.data?.message || requestError.message || "Failed to save reminder preference"); }
    finally { setLoading(false); }
  };

  return <Card sx={{ borderRadius: 2 }}><CardContent sx={{ p: 4 }}><Stack spacing={3}>
    <Box><Typography variant="h5" fontWeight={700}>Reminders</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Select when you would like to be reminded.</Typography></Box>
    {error && <Alert severity="error">{error}</Alert>}
    <RadioGroup value={String(minutesBefore)} onChange={(event) => setMinutesBefore(event.target.value)}><FormControlLabel value="5" control={<Radio />} label="5 minutes before" /><FormControlLabel value="15" control={<Radio />} label="15 minutes before" /><FormControlLabel value="30" control={<Radio />} label="30 minutes before" /></RadioGroup>
    <Stack direction="row" spacing={2}><Button variant="outlined" onClick={onBack}>Back</Button><Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Next"}</Button></Stack>
  </Stack></CardContent></Card>;
}

export default Reminder;
