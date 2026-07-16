import { useState } from "react";
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert } from "@mui/material";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";

function SleepSchedule({ onNext, onBack, userId }) {
    const [formData, setFormData] = useState({
        bedTime: "22:00",
        wakeTime: "06:00",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setError("");
        setLoading(true);

        try {
            await axios.post(`${API_BASE_URL}/onboarding/sleep-schedule`, {
                userId,
                ...formData,
            });
            onNext();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save sleep schedule");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            😴 Sleep Schedule
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            Tell us about your sleep routine
                        </Typography>
                    </Box>

                    {error && <Alert severity="error">{error}</Alert>}

                    <Stack spacing={2}>
                        <TextField
                            label="Bed Time"
                            type="time"
                            value={formData.bedTime}
                            onChange={(e) => setFormData({ ...formData, bedTime: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        <TextField
                            label="Wake Time"
                            type="time"
                            value={formData.wakeTime}
                            onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                    </Stack>

                    <Stack direction="row" spacing={2}>
                        <Button variant="outlined" onClick={onBack}>
                            Back
                        </Button>
                        <Button variant="contained" onClick={handleSubmit} disabled={loading} fullWidth>
                            {loading ? "Saving..." : "Next"}
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default SleepSchedule;