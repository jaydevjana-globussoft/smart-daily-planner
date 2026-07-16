import TextField from "@mui/material/TextField";

function CustomInput({
  label,
  value,
  onChange,
  type = "text",
}) {
  return (
    <TextField
      fullWidth
      label={label}
      type={type}
      value={value}
      onChange={onChange}
      InputLabelProps={
        type === "time"
          ? { shrink: true }
          : undefined
      }
    />
  );
}

export default CustomInput;