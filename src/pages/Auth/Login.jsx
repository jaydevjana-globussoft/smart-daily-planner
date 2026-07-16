import { useState } from "react";
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert } from "@mui/material";
import axios from "axios";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async () => {
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);
            if (response.data.success) {
                // Store user info in localStorage
                localStorage.setItem("userId", response.data.user.id);
                localStorage.setItem("userName", response.data.user.name);
                localStorage.setItem("userEmail", response.data.user.email);

                // Check onboarding status
                const statusResponse = await axios.get(`${API_BASE_URL}/onboarding/status/${response.data.user.id}`);
                
                if (statusResponse.data.onboardingCompleted) {
                    navigate("/dashboard");
                } else {
                    navigate("/onboarding");
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
                px: 2
            }}
        >
            <Card sx={{ width: { xs: "100%", sm: 480 }, borderRadius: 4, boxShadow: 4 }}>
                <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h4" fontWeight={700}>
                                Welcome back
                            </Typography>
                            <Typography color="text.secondary">
                                Sign in to keep your routine on track.
                            </Typography>
                        </Box>

                        {error && <Alert severity="error">{error}</Alert>}

                        <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth />
                        <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth />

                        <Button variant="contained" size="large" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>

                        <Button variant="outlined" size="large" onClick={() => navigate("/onboarding")}>
                            Start Onboarding
                        </Button>

                        <Typography variant="body2" textAlign="center">
                            New here? <RouterLink to="/register">Create account</RouterLink>
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Login;