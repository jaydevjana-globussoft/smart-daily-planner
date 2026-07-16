import { useEffect, useState } from "react";
import { Box, Step, StepLabel, Stepper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import WorkSchedule from "./WorkSchedule";
import SleepSchedule from "./SleepSchedule";
import Fitness from "./Fitness";
import Hobbies from "./Hobbies";
import Goals from "./Goals";
import Motivation from "./Motivation";
import Reminder from "./Reminder";
import Summary from "./Summary";

const steps = [
  "Work Schedule",
  "Sleep Schedule",
  "Fitness",
  "Hobbies",
  "Goals",
  "Motivation",
  "Reminder",
  "Summary",
];

function OnboardingFlow({ initialStep = 0 }) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(initialStep);
  const [motivationStyle, setMotivationStyle] = useState("balanced");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/register");
    }
  }, [navigate, userId]);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <WorkSchedule onNext={handleNext} userId={userId} />;
      case 1:
        return <SleepSchedule onNext={handleNext} onBack={handleBack} userId={userId} />;
      case 2:
        return <Fitness onNext={handleNext} onBack={handleBack} userId={userId} />;
      case 3:
        return <Hobbies onNext={handleNext} onBack={handleBack} userId={userId} />;
      case 4:
        return <Goals onNext={handleNext} onBack={handleBack} userId={userId} />;
      case 5:
        return <Motivation onNext={handleNext} onBack={handleBack} onSave={setMotivationStyle} userId={userId} />;
      case 6:
        return <Reminder onNext={handleNext} onBack={handleBack} motivationStyle={motivationStyle} userId={userId} />;
      case 7:
        return <Summary onComplete={() => navigate("/dashboard")} onBack={handleBack} userId={userId} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7fa", py: 4, px: 2 }}>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStep()}
      </Box>
    </Box>
  );
}

export default OnboardingFlow;
