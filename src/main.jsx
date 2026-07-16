import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";

import App from "./App";

import { OnboardingProvider } from "./context/OnboardingContext";
import { PWAProvider } from "./context/pwaContext";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import theme from "./theme/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>

    <CssBaseline />

    <QueryClientProvider client={queryClient}>
      <OnboardingProvider>
        <PWAProvider>
          <App />
        </PWAProvider>
      </OnboardingProvider>
    </QueryClientProvider>

    </ThemeProvider>
  </React.StrictMode>
);