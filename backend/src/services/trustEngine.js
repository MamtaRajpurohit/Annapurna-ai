const categoryRisk = {
  cooked: 1.0,
  dairy: 0.85,
  raw: 0.75,
  packaged: 0.65
};

const storageBoost = {
  refrigerated: 1.0,
  insulated: 0.88,
  room: 0.7
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function hoursSince(isoTime) {
  if (!isoTime) return 4;
  const diff = Date.now() - new Date(isoTime).getTime();
  return clamp(diff / 3600000, 0, 48);
}

function calculateFoodTrust(input = {}) {
  const prepHours = hoursSince(input.preparedAt);
  const timeScore = clamp(100 - prepHours * 3.5, 20, 100);
  const catFactor = categoryRisk[input.category] ?? 0.8;
  const storageFactor = storageBoost[input.storageCondition] ?? 0.75;
  const temp = Number(input.temperatureC ?? 24);
  const tempScore = clamp(100 - Math.max(0, temp - 5) * 2.8, 20, 100);
  const imageFreshness = clamp(Number(input.imageFreshness ?? 70), 0, 100);

  const scoreRaw =
    timeScore * 0.28 +
    catFactor * 100 * 0.2 +
    storageFactor * 100 * 0.2 +
    tempScore * 0.17 +
    imageFreshness * 0.15;

  const score = clamp(Math.round(scoreRaw), 0, 100);
  const label = score >= 75 ? "Safe" : score >= 50 ? "Use Immediately" : "Risky";

  return { score, label };
}

module.exports = { calculateFoodTrust };