import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  Chip,
  Avatar,
  CircularProgress,
  Skeleton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  PersonRounded,
  EmailRounded,
  PhoneRounded,
  CalendarMonthRounded,
  EditRounded,
  SaveRounded,
  CloseRounded,
  FlagRounded,
  CheckCircleRounded,
  WorkOutlineRounded,
  ScheduleRounded,
  FitnessCenterRounded,
  VerifiedRounded,
  InfoOutlined,
} from "@mui/icons-material";
import axios from "axios";
import MainLayout from "../../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";

const cardMotion = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" },
};
const cardSx = {
  borderRadius: 3,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  bgcolor: "background.paper",
};

function Profile() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Editable form state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${API_BASE_URL}/profile/${userId}`
        );
        if (data.success && data.profile) {
          setProfile(data.profile);
          setEditName(data.profile.name || "");
          setEditPhone(data.profile.phone || "");
          setEditBio(data.profile.bio || "");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, navigate]);

  const handleEditToggle = () => {
    if (editing) {
      // Cancel: reset form to current profile values
      setEditName(profile?.name || "");
      setEditPhone(profile?.phone || "");
      setEditBio(profile?.bio || "");
    }
    setEditing((prev) => !prev);
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!editName.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/profile/${userId}`,
        {
          name: editName.trim(),
          phone: editPhone.trim(),
          bio: editBio.trim(),
        }
      );

      if (data.success && data.profile) {
        setProfile(data.profile);
        localStorage.setItem("userName", data.profile.name);
        setEditing(false);
        setSuccess("Profile updated successfully!");
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "—";
    const [hours, minutes] = time.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(2000, 0, 1, hours, minutes));
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!userId) return null;

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 1, sm: 2 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={850}>
            Profile
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            View and manage your account details, schedule
            preferences, and personal goals.
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        )}

        {loading ? (
          <Grid container spacing={3.5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Skeleton
                variant="rounded"
                height={340}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Skeleton
                variant="rounded"
                height={340}
                sx={{ borderRadius: 3, mb: 3 }}
              />
              <Skeleton
                variant="rounded"
                height={200}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          </Grid>
        ) : profile ? (
          <Grid container spacing={3.5}>
            {/* Left Column: Avatar + Account Info */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={3}>
                {/* Profile Card */}
                <Card
                  component={motion.div}
                  {...cardMotion}
                  sx={cardSx}
                >
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <Avatar
                      src={profile.profilePicture || undefined}
                      sx={{
                        bgcolor: "primary.main",
                        width: 88,
                        height: 88,
                        mx: "auto",
                        mb: 2,
                        fontSize: 32,
                        fontWeight: 700,
                        boxShadow:
                          "0 8px 24px rgba(79, 70, 229, 0.25)",
                      }}
                    >
                      {!profile.profilePicture &&
                        getInitials(profile.name)}
                    </Avatar>

                    {editing ? (
                      <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                          label="Full Name"
                          value={editName}
                          onChange={(e) =>
                            setEditName(e.target.value)
                          }
                          fullWidth
                          size="small"
                          required
                          error={editing && !editName.trim()}
                          helperText={
                            editing && !editName.trim()
                              ? "Name is required"
                              : ""
                          }
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                        />
                        <TextField
                          label="Phone Number"
                          value={editPhone}
                          onChange={(e) =>
                            setEditPhone(e.target.value)
                          }
                          fullWidth
                          size="small"
                          placeholder="+1 234 567 8900"
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                        />
                        <TextField
                          label="Bio"
                          value={editBio}
                          onChange={(e) =>
                            setEditBio(e.target.value)
                          }
                          fullWidth
                          size="small"
                          multiline
                          minRows={2}
                          maxRows={4}
                          placeholder="Tell us a bit about yourself..."
                          inputProps={{ maxLength: 300 }}
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                        />
                      </Stack>
                    ) : (
                      <>
                        <Typography
                          variant="h5"
                          fontWeight={800}
                        >
                          {profile.name}
                        </Typography>
                        {profile.bio && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 1,
                              fontStyle: "italic",
                              lineHeight: 1.5,
                            }}
                          >
                            "{profile.bio}"
                          </Typography>
                        )}
                      </>
                    )}

                    <Divider sx={{ my: 2.5 }} />

                    <List disablePadding dense>
                      <ListItem disableGutters sx={{ py: 0.75 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <EmailRounded
                            fontSize="small"
                            color="primary"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={profile.email}
                          primaryTypographyProps={{
                            fontSize: 13.5,
                            fontWeight: 600,
                            noWrap: true,
                          }}
                        />
                      </ListItem>

                      {(profile.phone || editing) && !editing && (
                        <ListItem
                          disableGutters
                          sx={{ py: 0.75 }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <PhoneRounded
                              fontSize="small"
                              color="primary"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              profile.phone || "Not provided"
                            }
                            primaryTypographyProps={{
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: profile.phone
                                ? "text.primary"
                                : "text.secondary",
                            }}
                          />
                        </ListItem>
                      )}

                      <ListItem disableGutters sx={{ py: 0.75 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CalendarMonthRounded
                            fontSize="small"
                            color="primary"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Joined ${formatDate(profile.createdAt)}`}
                          primaryTypographyProps={{
                            fontSize: 13.5,
                            fontWeight: 600,
                          }}
                        />
                      </ListItem>

                      <ListItem disableGutters sx={{ py: 0.75 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <VerifiedRounded
                            fontSize="small"
                            color={
                              profile.onboardingCompleted
                                ? "success"
                                : "warning"
                            }
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography
                                variant="body2"
                                fontWeight={600}
                              >
                                Status
                              </Typography>
                              <Chip
                                label={
                                  profile.onboardingCompleted
                                    ? "Active"
                                    : "Onboarding"
                                }
                                size="small"
                                color={
                                  profile.onboardingCompleted
                                    ? "success"
                                    : "warning"
                                }
                                sx={{ fontWeight: 700 }}
                              />
                            </Stack>
                          }
                        />
                      </ListItem>
                    </List>

                    <Divider sx={{ my: 2 }} />

                    {/* Edit / Save / Cancel buttons */}
                    {editing ? (
                      <Stack direction="row" spacing={1.5}>
                        <Button
                          variant="outlined"
                          color="inherit"
                          startIcon={<CloseRounded />}
                          onClick={handleEditToggle}
                          disabled={saving}
                          fullWidth
                          sx={{
                            fontWeight: 700,
                            borderRadius: 2,
                            textTransform: "none",
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={
                            saving ? (
                              <CircularProgress
                                size={18}
                                color="inherit"
                              />
                            ) : (
                              <SaveRounded />
                            )
                          }
                          onClick={handleSave}
                          disabled={saving}
                          fullWidth
                          sx={{
                            fontWeight: 700,
                            borderRadius: 2,
                            textTransform: "none",
                          }}
                        >
                          {saving ? "Saving..." : "Save"}
                        </Button>
                      </Stack>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditRounded />}
                        onClick={handleEditToggle}
                        fullWidth
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          textTransform: "none",
                          py: 1.25,
                        }}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            {/* Right Column: Goals Summary + Schedule Overview */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={3}>
                {/* Daily Goals Summary */}
                <Card
                  component={motion.div}
                  {...cardMotion}
                  transition={{
                    ...cardMotion.transition,
                    delay: 0.08,
                  }}
                  sx={cardSx}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ mb: 2.5 }}
                    >
                      <FlagRounded color="primary" />
                      <Typography variant="h6" fontWeight={800}>
                        Personal Goals
                      </Typography>
                      <Chip
                        label={`${profile.personalGoals?.length || 0} goals`}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ fontWeight: 700, ml: "auto" }}
                      />
                    </Stack>
                    <Divider sx={{ mb: 2 }} />

                    {profile.personalGoals?.length > 0 ? (
                      <List disablePadding>
                        {profile.personalGoals.map(
                          (goal, idx) => (
                            <ListItem
                              key={idx}
                              disableGutters
                              divider={
                                idx <
                                profile.personalGoals.length - 1
                              }
                              sx={{ py: 1.5, px: 0.5 }}
                            >
                              <ListItemIcon
                                sx={{ minWidth: 36 }}
                              >
                                <CheckCircleRounded
                                  fontSize="small"
                                  color="success"
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={goal.goal}
                                secondary={`Priority: ${goal.priority || "—"} • Frequency: ${goal.frequency || "—"}`}
                                primaryTypographyProps={{
                                  fontWeight: 700,
                                }}
                                secondaryTypographyProps={{
                                  sx: {
                                    textTransform:
                                      "capitalize",
                                    mt: 0.25,
                                  },
                                }}
                              />
                              <Chip
                                label={goal.priority || "—"}
                                size="small"
                                color={
                                  goal.priority === "high"
                                    ? "error"
                                    : goal.priority ===
                                        "medium"
                                      ? "warning"
                                      : "info"
                                }
                                variant="outlined"
                                sx={{
                                  fontWeight: 700,
                                  textTransform: "capitalize",
                                }}
                              />
                            </ListItem>
                          )
                        )}
                      </List>
                    ) : (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 5,
                        }}
                      >
                        <InfoOutlined
                          sx={{
                            fontSize: 40,
                            color: "text.secondary",
                            mb: 1,
                          }}
                        />
                        <Typography
                          color="text.secondary"
                          fontWeight={600}
                        >
                          No personal goals set yet.
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          Head to the Goals page to define what
                          you want to achieve.
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate("/goals")}
                          sx={{
                            mt: 2,
                            fontWeight: 700,
                            textTransform: "none",
                          }}
                        >
                          Set Goals
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Schedule Overview */}
                <Card
                  component={motion.div}
                  {...cardMotion}
                  transition={{
                    ...cardMotion.transition,
                    delay: 0.14,
                  }}
                  sx={cardSx}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ mb: 2.5 }}
                    >
                      <ScheduleRounded color="primary" />
                      <Typography variant="h6" fontWeight={800}>
                        Schedule Overview
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 2.5 }} />

                    <Grid container spacing={3}>
                      {/* Work Schedule */}
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box
                          sx={{
                            p: 2.5,
                            borderRadius: 2,
                            bgcolor: "rgba(37, 99, 235, 0.05)",
                            border:
                              "1px solid rgba(37, 99, 235, 0.12)",
                            height: "100%",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mb: 1.5 }}
                          >
                            <WorkOutlineRounded
                              fontSize="small"
                              sx={{ color: "#2563eb" }}
                            />
                            <Typography
                              variant="subtitle2"
                              fontWeight={800}
                            >
                              Work
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                          >
                            {formatTime(
                              profile.workSchedule?.startTime
                            )}{" "}
                            –{" "}
                            {formatTime(
                              profile.workSchedule?.endTime
                            )}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            useFlexGap
                            flexWrap="wrap"
                            sx={{ mt: 1.5 }}
                          >
                            {(
                              profile.workSchedule?.workDays || []
                            ).map((day) => (
                              <Chip
                                key={day}
                                label={day.slice(0, 3)}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: 11,
                                  height: 22,
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      </Grid>

                      {/* Sleep Schedule */}
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box
                          sx={{
                            p: 2.5,
                            borderRadius: 2,
                            bgcolor: "rgba(71, 85, 105, 0.05)",
                            border:
                              "1px solid rgba(71, 85, 105, 0.12)",
                            height: "100%",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mb: 1.5 }}
                          >
                            <ScheduleRounded
                              fontSize="small"
                              sx={{ color: "#475569" }}
                            />
                            <Typography
                              variant="subtitle2"
                              fontWeight={800}
                            >
                              Sleep
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                          >
                            Wake:{" "}
                            {formatTime(
                              profile.sleepSchedule?.wakeTime
                            )}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ mt: 0.5 }}
                          >
                            Bed:{" "}
                            {formatTime(
                              profile.sleepSchedule?.bedTime
                            )}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Gym Schedule */}
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box
                          sx={{
                            p: 2.5,
                            borderRadius: 2,
                            bgcolor: "rgba(220, 38, 38, 0.05)",
                            border:
                              "1px solid rgba(220, 38, 38, 0.12)",
                            height: "100%",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mb: 1.5 }}
                          >
                            <FitnessCenterRounded
                              fontSize="small"
                              sx={{ color: "#dc2626" }}
                            />
                            <Typography
                              variant="subtitle2"
                              fontWeight={800}
                            >
                              Fitness
                            </Typography>
                            <Chip
                              label={
                                profile.gymSchedule?.isActive
                                  ? "Active"
                                  : "Inactive"
                              }
                              size="small"
                              color={
                                profile.gymSchedule?.isActive
                                  ? "success"
                                  : "default"
                              }
                              sx={{
                                fontWeight: 700,
                                fontSize: 10,
                                height: 20,
                                ml: "auto",
                              }}
                            />
                          </Stack>
                          {profile.gymSchedule?.isActive ? (
                            <>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                              >
                                {profile.gymSchedule?.frequency ||
                                  "—"}{" "}
                                days/week
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ mt: 0.5 }}
                              >
                                {profile.gymSchedule?.duration ||
                                  "—"}{" "}
                                min at{" "}
                                {formatTime(
                                  profile.gymSchedule
                                    ?.preferredTime
                                )}
                              </Typography>
                            </>
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight={600}
                            >
                              Gym is currently disabled.
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Hobbies row */}
                    {profile.hobbies?.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={800}
                          color="text.secondary"
                          sx={{ mb: 1.5 }}
                        >
                          HOBBIES
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          useFlexGap
                          flexWrap="wrap"
                        >
                          {profile.hobbies.map((hobby, idx) => (
                            <Chip
                              key={idx}
                              label={
                                typeof hobby === "string"
                                  ? hobby
                                  : hobby.name || "—"
                              }
                              color="secondary"
                              variant="outlined"
                              sx={{ fontWeight: 650 }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <PersonRounded
              sx={{ fontSize: 48, color: "text.secondary" }}
            />
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ mt: 2 }}
            >
              Profile not found
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Please log in again to access your profile.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{ mt: 3, fontWeight: 700, textTransform: "none" }}
            >
              Go to Login
            </Button>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
}

export default Profile;