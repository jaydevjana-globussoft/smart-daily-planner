import { motion } from "framer-motion";
import {
  ArchiveOutlined,
  EditOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  ScheduleOutlined,
  FlagRounded,
  RepeatRounded,
  NotificationsNoneRounded,
  CalendarTodayRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Stack,
  Tooltip,
  Typography,
  Avatar,
} from "@mui/material";

/* ── Category colour palette ─────────────────────────── */
const CATEGORY_META = {
  Work:       { color: "#2563eb", bg: "#dbeafe", emoji: "💼" },
  Gym:        { color: "#dc2626", bg: "#fee2e2", emoji: "🏋️" },
  Reading:    { color: "#16a34a", bg: "#dcfce7", emoji: "📚" },
  Study:      { color: "#7c3aed", bg: "#ede9fe", emoji: "📖" },
  Meditation: { color: "#0891b2", bg: "#cffafe", emoji: "🧘" },
  Music:      { color: "#db2777", bg: "#fce7f3", emoji: "🎵" },
  Singing:    { color: "#ea580c", bg: "#ffedd5", emoji: "🎤" },
  Dancing:    { color: "#d97706", bg: "#fef3c7", emoji: "💃" },
  Sports:     { color: "#15803d", bg: "#dcfce7", emoji: "⚽" },
  Custom:     { color: "#64748b", bg: "#f1f5f9", emoji: "⭐" },
};

const PRIORITY_COLOR = { High: "error", Medium: "warning", Low: "success" };
const STATUS_COLOR   = { active: "success", paused: "warning", archived: "default" };

function getCategoryMeta(category) {
  return CATEGORY_META[category] || CATEGORY_META.Custom;
}

/* ── Small info row inside the card ─────────────────── */
function InfoRow({ icon, text }) {
  if (!text) return null;
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box sx={{ color: "text.disabled", display: "flex" }}>{icon}</Box>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={600}
        sx={{ lineHeight: 1.4 }}
      >
        {text}
      </Typography>
    </Stack>
  );
}

/* ── Main component ──────────────────────────────────── */
function ActivityCard({ activity, onArchive, onDelete, onEdit, onPauseResume }) {
  const paused   = activity.status === "paused";
  const archived = activity.status === "archived";
  const meta     = getCategoryMeta(activity.category);

  const workingDaysText =
    activity.workingDays?.length
      ? activity.workingDays.map((d) => d.slice(0, 3)).join(" · ")
      : "All days";

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(15,23,42,0.12)" }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
        opacity: archived ? 0.72 : 1,
        overflow: "hidden",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
      }}
    >
      {/* ── Coloured top accent bar ── */}
      <Box sx={{ height: 4, bgcolor: meta.color, flexShrink: 0 }} />

      {/* ── Card body ── */}
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          px: { xs: 2, sm: 3 },
          pt: 3,
          pb: 2,
          gap: 0,
        }}
      >
        {/* Avatar + status badge */}
        <Box sx={{ position: "relative", mb: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: meta.bg,
              fontSize: 28,
              border: `2px solid ${meta.color}22`,
            }}
          >
            {meta.emoji}
          </Avatar>
          <Chip
            label={activity.status}
            size="small"
            color={STATUS_COLOR[activity.status] || "default"}
            sx={{
              position: "absolute",
              bottom: -8,
              left: "50%",
              transform: "translateX(-50%)",
              fontWeight: 700,
              fontSize: 10,
              height: 20,
              textTransform: "capitalize",
            }}
          />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            mt: 1.5,
            lineHeight: 1.25,
            wordBreak: "break-word",
            px: 1,
          }}
        >
          {activity.title}
        </Typography>

        {/* Category · Frequency */}
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={600}
          sx={{ mt: 0.5 }}
        >
          {activity.category} · {activity.frequency}
        </Typography>

        {/* Priority + Duration + Preferred time chips */}
        <Stack
          direction="row"
          spacing={0.75}
          useFlexGap
          flexWrap="wrap"
          justifyContent="center"
          sx={{ mt: 2 }}
        >
          <Chip
            size="small"
            label={`${activity.priority} Priority`}
            color={PRIORITY_COLOR[activity.priority]}
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
          <Chip
            size="small"
            icon={<ScheduleOutlined />}
            label={`${activity.duration} min`}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            size="small"
            label={activity.preferredTime}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Stack>

        <Divider sx={{ width: "100%", my: 2 }} />

        {/* Info rows */}
        <Stack spacing={0.85} alignItems="center" sx={{ width: "100%" }}>
          <InfoRow
            icon={<CalendarTodayRounded sx={{ fontSize: 14 }} />}
            text={workingDaysText}
          />
          <InfoRow
            icon={<NotificationsNoneRounded sx={{ fontSize: 14 }} />}
            text={`Reminder ${activity.reminderTime} min before`}
          />
          {activity.goal && (
            <InfoRow
              icon={<FlagRounded sx={{ fontSize: 14 }} />}
              text={activity.goal}
            />
          )}
          {activity.description && (
            <InfoRow
              icon={<RepeatRounded sx={{ fontSize: 14 }} />}
              text={activity.description}
            />
          )}
        </Stack>
      </CardContent>

      {/* ── Action footer ── */}
      <Divider />
      <CardActions
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: 1.5,
          justifyContent: "space-between",
          flexShrink: 0,
          gap: 0.5,
        }}
      >
        {/* Left: Edit + Pause/Resume */}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          <Tooltip title={archived ? "Cannot edit archived activity" : "Edit"}>
            <span>
              <Button
                size="small"
                onClick={() => onEdit(activity)}
                disabled={archived}
                startIcon={<EditOutlined />}
                sx={{
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: 12,
                }}
              >
                Edit
              </Button>
            </span>
          </Tooltip>

          {!archived && (
            <Tooltip title={paused ? "Resume activity" : "Pause activity"}>
              <Button
                size="small"
                onClick={() => onPauseResume(activity)}
                startIcon={
                  paused ? <PlayCircleOutlined /> : <PauseCircleOutlined />
                }
                color={paused ? "success" : "warning"}
                sx={{
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: 12,
                }}
              >
                {paused ? "Resume" : "Pause"}
              </Button>
            </Tooltip>
          )}
        </Stack>

        {/* Right: Archive + Delete */}
        <Stack direction="row" spacing={0.5}>
          {!archived && (
            <Tooltip title="Archive">
              <Button
                size="small"
                color="inherit"
                onClick={() => onArchive(activity)}
                sx={{ minWidth: 0, px: 1 }}
              >
                <ArchiveOutlined fontSize="small" />
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Delete permanently">
            <Button
              size="small"
              color="error"
              onClick={() => onDelete(activity)}
              sx={{ minWidth: 0, px: 1 }}
            >
              <DeleteOutlined fontSize="small" />
            </Button>
          </Tooltip>
        </Stack>
      </CardActions>
    </Card>
  );
}

export default ActivityCard;
