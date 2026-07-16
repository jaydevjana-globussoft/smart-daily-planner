import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const CATEGORIES = [
  "Work",
  "Gym",
  "Reading",
  "Study",
  "Meditation",
  "Music",
  "Singing",
  "Dancing",
  "Sports",
  "Custom",
];
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const PRIORITIES = ["Low", "Medium", "High"];
const TIMES = ["Morning", "Afternoon", "Evening", "Anytime"];
const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Custom"];

const EMPTY = {
  title: "",
  category: "Work",
  priority: "Medium",
  duration: 60,
  preferredTime: "Anytime",
  workingDays: [],
  reminderTime: 15,
  frequency: "Weekly",
  goal: "",
  description: "",
};

function ActivityForm({ activity, loading, onClose, onSubmit, open }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  // Reset form when dialog opens or activity changes
  useEffect(() => {
    if (!open) return;
    setValues(activity ? { ...EMPTY, ...activity } : EMPTY);
    setErrors({});
  }, [open, activity]);

  const set = (field, value) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const toggleDay = (day) =>
    set(
      "workingDays",
      values.workingDays.includes(day)
        ? values.workingDays.filter((d) => d !== day)
        : [...values.workingDays, day]
    );

  const validate = () => {
    const errs = {};
    if (!values.title?.trim()) {
      errs.title = "Title is required";
    } else if (values.title.trim().length > 120) {
      errs.title = "Title must be 120 characters or fewer";
    }
    const dur = Number(values.duration);
    if (!values.duration || Number.isNaN(dur) || dur < 5) {
      errs.duration = "Duration must be at least 5 minutes";
    } else if (dur > 1440) {
      errs.duration = "Duration cannot exceed 1440 minutes (24 hours)";
    }
    const rem = Number(values.reminderTime);
    if (Number.isNaN(rem) || rem < 0) {
      errs.reminderTime = "Reminder time cannot be negative";
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSubmit({
      ...values,
      title: values.title.trim(),
      duration: Number(values.duration),
      reminderTime: Number(values.reminderTime ?? 15),
      goal: values.goal?.trim() || "",
      description: values.description?.trim() || "",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle fontWeight={800} sx={{ pb: 1 }}>
        {activity ? "Edit Activity" : "Create Activity"}
      </DialogTitle>
      <Divider />

      {/* ── The <form> wraps everything including the action buttons ── */}
      <Box
        component="form"
        id="activity-form"
        noValidate
        onSubmit={handleSubmit}
      >
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2.25}>
            {/* Title */}
            <Grid size={{ xs: 12, sm: 7 }}>
              <TextField
                autoFocus
                fullWidth
                required
                label="Activity Title"
                value={values.title}
                error={Boolean(errors.title)}
                helperText={errors.title}
                onChange={(e) => set("title", e.target.value)}
                inputProps={{ maxLength: 120 }}
              />
            </Grid>

            {/* Category */}
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                select
                fullWidth
                label="Category"
                value={values.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Priority */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="Priority"
                value={values.priority}
                onChange={(e) => set("priority", e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Duration */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                required
                label="Duration (minutes)"
                type="number"
                value={values.duration}
                error={Boolean(errors.duration)}
                helperText={errors.duration}
                onChange={(e) => set("duration", e.target.value)}
                inputProps={{ min: 5, max: 1440 }}
              />
            </Grid>

            {/* Preferred Time */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="Preferred Time"
                value={values.preferredTime}
                onChange={(e) => set("preferredTime", e.target.value)}
              >
                {TIMES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Frequency */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Frequency"
                value={values.frequency}
                onChange={(e) => set("frequency", e.target.value)}
              >
                {FREQUENCIES.map((f) => (
                  <MenuItem key={f} value={f}>
                    {f}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Reminder Time */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Reminder (minutes before)"
                type="number"
                value={values.reminderTime}
                error={Boolean(errors.reminderTime)}
                helperText={errors.reminderTime}
                onChange={(e) => set("reminderTime", e.target.value)}
                inputProps={{ min: 0, max: 1440 }}
              />
            </Grid>

            {/* Goal */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Linked Goal (optional)"
                value={values.goal}
                onChange={(e) => set("goal", e.target.value)}
                placeholder="What will this activity help you achieve?"
                inputProps={{ maxLength: 160 }}
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description (optional)"
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                multiline
                minRows={3}
                inputProps={{ maxLength: 1000 }}
              />
            </Grid>

            {/* Working Days */}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ mb: 0.75 }}
              >
                Working Days
              </Typography>
              <FormGroup row>
                {DAYS.map((day) => (
                  <FormControlLabel
                    key={day}
                    label={day.slice(0, 3)}
                    control={
                      <Checkbox
                        checked={values.workingDays.includes(day)}
                        onChange={() => toggleDay(day)}
                        size="small"
                      />
                    }
                  />
                ))}
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{ fontWeight: 700, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ fontWeight: 700, textTransform: "none", minWidth: 140 }}
          >
            {loading
              ? "Saving…"
              : activity
                ? "Save Changes"
                : "Create Activity"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default ActivityForm;
