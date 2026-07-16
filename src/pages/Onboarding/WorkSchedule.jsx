import { useState } from "react";
import { Box, Button, Card, CardContent, Stack, TextField, Typography, FormGroup, FormControlLabel, Checkbox, Alert } from "@mui/material";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";

function WorkSchedule({ onNext, userId }) {
    const [formData, setFormData] = useState({
        startTime: "09:00",
        endTime: "18:00",
        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const workDayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const handleDayChange = (day) => {
        setFormData({
            ...formData,
            workDays: formData.workDays.includes(day)
                ? formData.workDays.filter((d) => d !== day)
                : [...formData.workDays, day],
        });
    };

    const handleSubmit = async () => {
        setError("");
        setLoading(true);

        try {
            await axios.post(`${API_BASE_URL}/onboarding/work-schedule`, {
                userId,
                ...formData,
            });
            onNext();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save work schedule");
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
                            💼 Work Schedule
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            Tell us about your professional work hours
                        </Typography>
                    </Box>

                    {error && <Alert severity="error">{error}</Alert>}

                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                            Work Timing
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Start Time"
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                label="End Time"
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Stack>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                            Work Days
                        </Typography>
                        <FormGroup>
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                                {workDayOptions.map((day) => (
                                    <FormControlLabel
                                        key={day}
                                        control={
                                            <Checkbox
                                                checked={formData.workDays.includes(day)}
                                                onChange={() => handleDayChange(day)}
                                            />
                                        }
                                        label={day}
                                    />
                                ))}
                            </Box>
                        </FormGroup>
                    </Box>

                    <Button variant="contained" size="large" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Saving..." : "Next"}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default WorkSchedule;