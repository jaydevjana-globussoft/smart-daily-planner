import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Stack, Box, TextField } from "@mui/material";

import OnboardingLayout from "../../components/onboarding/OnboardingLayout";
import { useOnboarding } from "../../context/OnboardingContext";
import { parseNameFromEmail } from "../../utils/timeUtils";

function Welcome() {
  const navigate = useNavigate();
  const { formData, updateFormData } = useOnboarding();
  const [email, setEmail] = useState(formData.user.email || "");

  const displayName = formData.user.name || parseNameFromEmail(email) || "there";

  const handleStart = () => {
    if (email) {
      updateFormData("user", {
        email,
        name: parseNameFromEmail(email),
      });
    }
    navigate("/onboarding/work");
  };

  return (
    <OnboardingLayout>
      <Stack spacing={4}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4">👋 Hi {displayName}!</Typography>
          <Typography variant="h5" sx={{ mt: 1 }}>
            I'm your Lifestyle Coach.
          </Typography>
          <Typography sx={{ mt: 1 }} color="text.secondary">
            I'll help you create a balanced life.
          </Typography>
          <Typography sx={{ mt: 2 }} color="text.secondary">
            First, tell me about yourself.
          </Typography>
        </Box>

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleStart}
            disabled={!email}
          >
            Start
          </Button>
        </Box>
      </Stack>
    </OnboardingLayout>
  );
}

export default Welcome;