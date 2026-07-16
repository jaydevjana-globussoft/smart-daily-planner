import Paper from "@mui/material/Paper";

function CustomCard({ children }) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 4,
      }}
    >
      {children}
    </Paper>
  );
}

export default CustomCard;