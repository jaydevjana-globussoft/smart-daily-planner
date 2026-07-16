import { useState } from "react";
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert } from "@mui/material";
import axios from "axios";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async () => {
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);
            if (response.data.success) {
                setSuccess(true);
                // Store user info in localStorage for onboarding
                localStorage.setItem("userId", response.data.user.id);
                localStorage.setItem("userName", response.data.user.name);
                localStorage.setItem("userEmail", response.data.user.email);

                // Redirect to onboarding after 2 seconds
                setTimeout(() => {
                    navigate("/onboarding");
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
                    px: 2,
                }}
            >
                <Card sx={{ width: { xs: "100%", sm: 520 }, borderRadius: 4, boxShadow: 4 }}>
                    <CardContent sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                            ✓ Account Created Successfully!
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            Welcome, {formData.name}! Redirecting to onboarding...
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
                px: 2
            }}
        >
            <Card sx={{ width: { xs: "100%", sm: 520 }, borderRadius: 4, boxShadow: 4 }}>
                <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h4" fontWeight={700}>
                                Create your account
                            </Typography>
                            <Typography color="text.secondary">
                                Start building a smarter daily routine.
                            </Typography>
                        </Box>

                        {error && <Alert severity="error">{error}</Alert>}

                        <TextField label="Full Name" name="name" value={formData.name} onChange={handleChange} fullWidth />
                        <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth />
                        <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth />

                        <Button variant="contained" size="large" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Creating account..." : "Create Account"}
                        </Button>

                        <Typography variant="body2" textAlign="center">
                            Already have an account? <RouterLink to="/login">Log in</RouterLink>
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Register;