import { useNavigate } from "react-router-dom";
import { Typography, Box, Button, Stack, Card, CardContent } from "@mui/material";
import OnboardingLayout from "../../components/onboarding/OnboardingLayout";
import { useOnboarding } from "../../context/OnboardingContext";

function PlanToday() {
  const navigate = useNavigate();
  const { formData } = useOnboarding();

  return (
    <OnboardingLayout>
      <Stack spacing={4}>
        <Typography variant="h3" textAlign="center">
          What is the plan for today?
        </Typography>

        <Typography variant="subtitle1" textAlign="center" color="text.secondary">
          You are a {formData.user.role} with {formData.user.experience}. Let's turn your routine into today's schedule.
        </Typography>

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6">Office</Typography>
                <Typography>{formData.work.office}</Typography>
                <Typography>{formData.work.startTime} - {formData.work.endTime}</Typography>
              </Box>

              <Box>
                <Typography variant="h6">Gym</Typography>
                <Typography>{formData.fitness.gym}</Typography>
                <Typography>{formData.fitness.gymDays}</Typography>
              </Box>

              <Box>
                <Typography variant="h6">Reading</Typography>
                <Typography>{formData.reading.activity}</Typography>
                <Typography>{formData.reading.days}</Typography>
              </Box>

              <Box>
                <Typography variant="h6">Football</Typography>
                <Typography>{formData.football.activity}</Typography>
                <Typography>{formData.football.day}</Typography>
              </Box>

              <Box>
                <Typography variant="h6">Sleep</Typography>
                <Typography>{formData.sleep.time}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Box display="flex" justifyContent="center" gap={2}>
          <Button variant="outlined" size="large" onClick={() => navigate("/onboarding/work")}>Edit Details</Button>
          <Button variant="contained" size="large" onClick={() => navigate("/onboarding/summary")}>Continue</Button>
        </Box>
      </Stack>
    </OnboardingLayout>
  );
}

export default PlanToday;
