import { useCallback, useEffect, useRef, useState } from "react";
import { AddRounded, InboxOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Skeleton,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import axios from "axios";
import MainLayout from "../../components/layout/MainLayout";
import ActivityCard from "../../components/activities/ActivityCard";
import ActivityForm from "../../components/activities/ActivityForm";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";

function Activities() {
  const userId = localStorage.getItem("userId");

  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [formOpen, setFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  // Guard against double submissions
  const savingRef = useRef(false);

  /* ── Load activities ── */
  const loadActivities = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/activities`, {
        params: {
          userId,
          ...(filter !== "all" ? { status: filter } : {}),
        },
      });
      if (!data.success)
        throw new Error(data.message || "Failed to load activities");
      setActivities(data.activities || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load activities"
      );
    } finally {
      setLoading(false);
    }
  }, [filter, userId]);

  useEffect(() => {
    const id = window.setTimeout(() => loadActivities(), 0);
    return () => window.clearTimeout(id);
  }, [loadActivities]);

  /* ── Save (create or edit) ── */
  const saveActivity = async (values) => {
    // Prevent double-click duplicate submissions
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError("");

    const isEditing = Boolean(editingActivity);
    const url = isEditing
      ? `${API_BASE_URL}/activities/${editingActivity._id}`
      : `${API_BASE_URL}/activities`;

    try {
      const payload = {
        userId,
        title: values.title?.trim(),
        category: values.category,
        priority: values.priority,
        duration: Number(values.duration),
        preferredTime: values.preferredTime,
        workingDays: values.workingDays || [],
        reminderTime: Number(values.reminderTime ?? 15),
        frequency: values.frequency,
        goal: values.goal?.trim() || "",
        description: values.description?.trim() || "",
      };

      const { data } = isEditing
        ? await axios.put(url, payload)
        : await axios.post(url, payload);

      if (!data.success)
        throw new Error(data.message || "Failed to save activity");

      // Close form first, then refresh list
      setFormOpen(false);
      setEditingActivity(null);

      // Show success toast
      setToast({
        open: true,
        message: isEditing
          ? `"${values.title}" updated successfully.`
          : `"${values.title}" created and saved to MongoDB!`,
        severity: "success",
      });

      // Refresh list — separate try so a refresh error doesn't mask success
      try {
        await loadActivities();
      } catch {
        // list will re-fetch on next render; not a critical failure
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to save activity. Please try again.";
      setError(message);
      setToast({ open: true, message, severity: "error" });
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  };

  /* ── Status helpers ── */
  const updateStatus = async (activity, action) => {
    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}/activities/${activity._id}/${action}`,
        { userId }
      );
      if (!data.success)
        throw new Error(data.message || "Failed to update activity");
      await loadActivities();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update activity"
      );
    }
  };

  const deleteActivity = async (activity) => {
    if (
      !window.confirm(
        `Delete "${activity.title}"? This cannot be undone.`
      )
    )
      return;
    try {
      const { data } = await axios.delete(
        `${API_BASE_URL}/activities/${activity._id}`,
        { params: { userId } }
      );
      if (!data.success)
        throw new Error(data.message || "Failed to delete activity");
      setToast({
        open: true,
        message: `"${activity.title}" deleted.`,
        severity: "info",
      });
      await loadActivities();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete activity"
      );
    }
  };

  const openCreate = () => {
    setEditingActivity(null);
    setError("");
    setFormOpen(true);
  };

  const openEdit = (activity) => {
    setEditingActivity(activity);
    setError("");
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    if (saving) return; // block close while saving
    setFormOpen(false);
    setEditingActivity(null);
    setError("");
  };

  /* ── Render ── */
  return (
    <MainLayout>
      <Stack spacing={3} sx={{ maxWidth: 1320, mx: "auto" }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Activity Management
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Create and organize the activities that move your goals
              forward.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={openCreate}
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: 2, px: 2.5 }}
          >
            Create Activity
          </Button>
        </Stack>

        {/* Error alert (for list-level errors) */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{ borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Filter row */}
        <ToggleButtonGroup
          size="small"
          exclusive
          value={filter}
          onChange={(_, value) => value && setFilter(value)}
          aria-label="Activity status filter"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="active">Active</ToggleButton>
          <ToggleButton value="paused">Paused</ToggleButton>
          <ToggleButton value="archived">Archived</ToggleButton>
        </ToggleButtonGroup>

        {/* List */}
        {loading ? (
          <Grid container spacing={3} alignItems="stretch">
            {Array.from({ length: 6 }, (_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Skeleton
                  variant="rounded"
                  height={380}
                  sx={{ borderRadius: 3 }}
                />
              </Grid>
            ))}
          </Grid>
        ) : activities.length ? (
          <Grid container spacing={3} alignItems="stretch">
            {activities.map((activity) => (
              <Grid key={activity._id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <ActivityCard
                  activity={activity}
                  onEdit={openEdit}
                  onDelete={deleteActivity}
                  onArchive={(item) => updateStatus(item, "archive")}
                  onPauseResume={(item) =>
                    updateStatus(
                      item,
                      item.status === "paused" ? "resume" : "pause"
                    )
                  }
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <InboxOutlined sx={{ fontSize: 42, color: "text.secondary" }} />
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ mt: 1.5 }}
            >
              No activities yet
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Create your first activity to start building a better
              routine.
            </Typography>
            <Button
              sx={{ mt: 2, fontWeight: 700, textTransform: "none" }}
              variant="contained"
              onClick={openCreate}
            >
              Create Activity
            </Button>
          </Box>
        )}

        {/* Count chip */}
        {!loading && (
          <Stack direction="row" spacing={1}>
            <Chip
              label={`${activities.length} shown`}
              variant="outlined"
            />
          </Stack>
        )}

        {/* Form dialog */}
        <ActivityForm
          open={formOpen}
          activity={editingActivity}
          loading={saving}
          onClose={handleCloseForm}
          onSubmit={saveActivity}
        />

        {/* Toast notifications */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4500}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={toast.severity}
            variant="filled"
            onClose={() => setToast((t) => ({ ...t, open: false }))}
            sx={{ minWidth: 320, borderRadius: 2, fontWeight: 600 }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Stack>
    </MainLayout>
  );
}

export default Activities;
