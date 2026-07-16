import Typography from "@mui/material/Typography";

function PageTitle({ children }) {
  return (
    <Typography
      variant="h4"
      fontWeight={700}
      gutterBottom
    >
      {children}
    </Typography>
  );
}

export default PageTitle;