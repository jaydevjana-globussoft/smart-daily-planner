import { createTheme } from "@mui/material/styles";

import colors from "./colors";
import typography from "./typography";

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
    },

    secondary: {
      main: colors.secondary,
    },

    background: {
      default: colors.background,
      paper: colors.surface,
    },

    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
  },

  typography,
});

export default theme;