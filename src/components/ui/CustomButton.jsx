import Button from "@mui/material/Button";

function CustomButton({
  children,
  onClick,
  type = "button",
  fullWidth = false,
  variant = "contained",
  color = "primary",
}) {
  return (
    <Button
      variant={variant}
      color={color}
      type={type}
      fullWidth={fullWidth}
      onClick={onClick}
      size="large"
      sx={{
        borderRadius: 3,
        textTransform: "none",
        py: 1.5,
        fontWeight: 600,
      }}
    >
      {children}
    </Button>
  );
}

export default CustomButton;