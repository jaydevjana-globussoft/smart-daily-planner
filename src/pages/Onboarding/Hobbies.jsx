import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Checkbox, FormControlLabel, FormGroup, Stack, Typography } from "@mui/material";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";
const hobbyOptions = ["Reading", "Singing", "Dancing", "Football", "Cricket", "Cycling", "Photography", "Cooking", "Coding"];

function Hobbies({ onNext, onBack, userId }) {
  const [selectedHobbies, setSelectedHobbies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleHobby = (name) => setSelectedHobbies((previous) => previous.includes(name) ? previous.filter((hobby) => hobby !== name) : [...previous, name]);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/onboarding/hobbies`, { userId, hobbies: selectedHobbies.map((name) => ({ name, frequency: "weekly", duration: 60, preferredTime: "evening" })) });
      if (!data.success) throw new Error(data.message || "Failed to save hobbies");
      onNext();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Failed to save hobbies");
    } finally { setLoading(false); }
  };

  return <Card sx={{ borderRadius: 2 }}><CardContent sx={{ p: 4 }}><Stack spacing={3}>
    <Box><Typography variant="h5" fontWeight={700}>Your hobbies</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Choose the activities you want included in your routine.</Typography></Box>
    {error && <Alert severity="error">{error}</Alert>}
    <FormGroup>{hobbyOptions.map((hobby) => <FormControlLabel key={hobby} label={hobby} control={<Checkbox checked={selectedHobbies.includes(hobby)} onChange={() => toggleHobby(hobby)} />} />)}</FormGroup>
    <Stack direction="row" spacing={2}><Button variant="outlined" onClick={onBack}>Back</Button><Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Next"}</Button></Stack>
  </Stack></CardContent></Card>;
}

export default Hobbies;
