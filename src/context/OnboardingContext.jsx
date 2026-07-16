import { createContext, useContext, useState } from "react";

const OnboardingContext = createContext();

export function OnboardingProvider({ children }) {
  const [formData, setFormData] = useState({
    user: {
      name: "",
      email: "",
    },

    work: {
      office: "Office",
      startTime: "9:00 AM",
      endTime: "6:00 PM",
      workingDays: [],
    },

    sleep: {
      sleepTime: "10:00 PM",
      wakeUpTime: "6:00 AM",
    },

    fitness: {
      gym: "Yes",
      gymDays: "4 Days",
      preferredTime: "Evening",
    },

    hobbyFrequency: {},

    hobbies: ["Reading", "Football"],

    goals: ["Improve Productivity", "Read More Books"],

    motivation: "Friendly",

    reminder: "Normal",
  });

  const updateFormData = (section, data) => {
    setFormData((prev) => ({
        ...prev,
        [section]: Array.isArray(data)
            ? data
            : typeof data === "string"
            ? data
            : {
                  ...prev[section],
                  ...data,
              },
    }));
};

  return (
    <OnboardingContext.Provider
      value={{
        formData,
        updateFormData,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}