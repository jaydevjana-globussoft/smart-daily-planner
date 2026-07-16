import { Box, Button } from "@mui/material";

function NavigationButtons({
  nextLabel = "Next",
  backLabel = "Back",
  onNext,
  onBack,
  hideBack = false,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mt: 5,
      }}
    >
      {hideBack ? (
        <div />
      ) : (
        <Button
          variant="outlined"
          onClick={onBack}
        >
          {backLabel}
        </Button>
      )}

      <Button
        variant="contained"
        onClick={onNext}
      >
        {nextLabel}
      </Button>
    </Box>
  );
}

export default NavigationButtons;