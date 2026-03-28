function getUrgency({ expiryAt, trustScore, category }) {
  const now = Date.now();
  const expiryMs = expiryAt
    ? new Date(expiryAt).getTime()
    : now + 8 * 3600000;

  let hrsToExpiry = (expiryMs - now) / 3600000;

  // Adjust for category
  if (category === "dairy") {
    hrsToExpiry -= 1.5;
  }

  if (trustScore < 45 || hrsToExpiry < 2) return "critical";
  if (trustScore < 65 || hrsToExpiry < 6) return "urgent";

  return "normal";
}

module.exports = { getUrgency };