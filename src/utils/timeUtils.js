export function format24ToAmPm(time24) {
  if (!time24) return "";
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
}

export function parseNameFromEmail(email) {
  if (!email) return "";
  const localPart = email.split("@")[0] || "";
  const normalized = localPart
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1).toLowerCase())
    .join(" ");
  return normalized || localPart;
}

export function formatAmPmString(value) {
  if (!value) return "";
  const normalized = value.trim().toUpperCase();
  const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  return match ? `${parseInt(match[1], 10)}:${match[2]} ${match[3]}` : value;
}
