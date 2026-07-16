import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";

function Summary({ onComplete, onBack, userId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = async () => {
    setError(""); setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/onboarding/complete`, { userId });
      if (!data.success) throw new Error(data.message || "Failed to generate your daily plan");
      onComplete();
    } catch (requestError) { setError(requestError.response?.data?.message || requestError.message || "Failed to generate your daily plan"); }
    finally { setLoading(false); }
  };

  return <Card sx={{ borderRadius: 2 }}><CardContent sx={{ p: 4 }}><Stack spacing={3}>
    <Box><Typography variant="h5" fontWeight={700}>Your plan is ready</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Generate a personalized routine from the preferences you saved.</Typography></Box>
    {error && <Alert severity="error">{error}</Alert>}
    <Stack direction="row" spacing={2}><Button variant="outlined" onClick={onBack}>Back</Button><Button variant="contained" fullWidth onClick={handleComplete} disabled={loading}>{loading ? "Generating..." : "Generate my daily plan"}</Button></Stack>
  </Stack></CardContent></Card>;
}

export default Summary;
