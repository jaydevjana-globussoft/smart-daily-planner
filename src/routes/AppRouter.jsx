import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import NotFound from "../pages/NotFound/NotFound";
import Activities from "../pages/Activities/Activities";
import Schedule from "../pages/Schedule/Schedule";
import Calendar from "../pages/Calendar/Calendar";
import Profile from "../pages/Profile/Profile";
import Welcome from "../pages/Onboarding/Welcome";
import OnboardingFlow from "../pages/Onboarding/OnboardingFlow";
import WorkspacePage from "../pages/Common/WorkspacePage";
import Notifications from "../pages/Notifications/Notifications";
import Goals from "../pages/Goals/Goals";
import Progress from "../pages/Progress/Progress";
import Settings from "../pages/Settings/Settings";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/onboarding" element={<Welcome />} />
        <Route path="/onboarding/work" element={<OnboardingFlow />} />
        <Route path="/onboarding/sleep" element={<OnboardingFlow initialStep={1} />} />
        <Route path="/onboarding/fitness" element={<OnboardingFlow initialStep={2} />} />
        <Route path="/onboarding/hobbies" element={<OnboardingFlow initialStep={3} />} />
        <Route path="/onboarding/goals" element={<OnboardingFlow initialStep={4} />} />
        <Route path="/onboarding/motivation" element={<OnboardingFlow initialStep={5} />} />
        <Route path="/onboarding/reminder" element={<OnboardingFlow initialStep={6} />} />
        <Route path="/onboarding/summary" element={<OnboardingFlow initialStep={7} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
