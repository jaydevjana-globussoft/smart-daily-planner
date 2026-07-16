import Typography from "@mui/material/Typography";

function SectionTitle({ children }) {
  return (
    <Typography
      variant="body1"
      color="text.secondary"
      sx={{
        mb: 2,
      }}
    >
      {children}
    </Typography>
  );
}

export default SectionTitle;