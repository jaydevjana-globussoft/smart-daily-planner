import { Stepper, Step, StepLabel, useMediaQuery, useTheme, Box } from "@mui/material";

const steps = [
  "Welcome",
  "Work",
  "Sleep",
  "Fitness",
  "Hobbies",
  "Goals",
  "Motivation",
  "Reminder",
  "Summary",
];

function ProgressStepper({ activeStep }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ mb: 5, overflowX: "auto", p: 1, bgcolor: "background.paper", borderRadius: 2 }}>
      <Stepper
        activeStep={activeStep}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ minWidth: "100%" }}
      >
        {steps.map((label) => (
          <Step key={label} sx={{ '& .MuiStepLabel-label': { typography: isMobile ? 'caption' : 'body2' } }}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

export default ProgressStepper;