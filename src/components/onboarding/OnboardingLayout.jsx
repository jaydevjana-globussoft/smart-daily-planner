import { Container, Paper, Box } from "@mui/material";

function OnboardingLayout({ children }) {
  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Paper
        elevation={4}
        sx={{
          padding: 5,
          borderRadius: 4,
        }}
      >
        {children}
      </Paper>
    </Container>
  );
}

export default OnboardingLayout;