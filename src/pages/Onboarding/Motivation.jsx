import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, FormControlLabel, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";

function Motivation({ onNext, onBack, onSave, userId }) {
  const [motivationStyle, setMotivationStyle] = useState("balanced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/onboarding/motivation-reminder`, { userId, motivationStyle, reminderPreference: { enabled: true, minutesBefore: 15, notificationType: "push" } });
      if (!data.success) throw new Error(data.message || "Failed to save motivation preference");
      onSave(motivationStyle);
      onNext();
    } catch (requestError) { setError(requestError.response?.data?.message || requestError.message || "Failed to save motivation preference"); }
    finally { setLoading(false); }
  };

  return <Card sx={{ borderRadius: 2 }}><CardContent sx={{ p: 4 }}><Stack spacing={3}>
    <Box><Typography variant="h5" fontWeight={700}>Motivation style</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Choose how your planner should encourage you.</Typography></Box>
    {error && <Alert severity="error">{error}</Alert>}
    <RadioGroup value={motivationStyle} onChange={(event) => setMotivationStyle(event.target.value)}><FormControlLabel value="gentle" control={<Radio />} label="Gentle" /><FormControlLabel value="balanced" control={<Radio />} label="Balanced" /><FormControlLabel value="push" control={<Radio />} label="Push me" /></RadioGroup>
    <Stack direction="row" spacing={2}><Button variant="outlined" onClick={onBack}>Back</Button><Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Next"}</Button></Stack>
  </Stack></CardContent></Card>;
}

export default Motivation;
