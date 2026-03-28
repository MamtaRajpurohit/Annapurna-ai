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

// =========================
// 🧠 DYNAMIC WEIGHTING
// =========================
function getDynamicWeights({ temperatureC, category }) {
  let weights = {
    time: 0.28,
    category: 0.2,
    storage: 0.2,
    temp: 0.17,
    image: 0.15
  };

  // 🔥 Hot weather → temperature matters more
  if (temperatureC > 32) {
    weights.temp += 0.05;
    weights.time -= 0.02;
  }

  // 🥛 Dairy → time matters more
  if (category === "dairy") {
    weights.time += 0.05;
    weights.image -= 0.02;
  }

  return weights;
}

// =========================
// ⚠️ RISK FLAGS
// =========================
function getRiskFlags({ temp, trustScore, prepHours }) {
  const flags = [];

  if (temp > 35) flags.push("🔥 Extreme heat risk");
  if (prepHours > 6) flags.push("⏱ Old food");
  if (trustScore < 50) flags.push("🚨 Unsafe for distribution");

  return flags;
}

// =========================
// 🧠 TRUST CALCULATION
// =========================
function calculateFoodTrust(input = {}) {
  const prepHours = hoursSince(input.preparedAt);
  const temp = Number(input.temperatureC ?? 24);

  const weights = getDynamicWeights({
    temperatureC: temp,
    category: input.category
  });

  const timeScore = clamp(100 - prepHours * 3.5, 20, 100);
  const catFactor = categoryRisk[input.category] ?? 0.8;
  const storageFactor = storageBoost[input.storageCondition] ?? 0.75;
  const tempScore = clamp(100 - Math.max(0, temp - 5) * 2.8, 20, 100);

  // 🔥 THIS NOW COMES FROM REAL AI
  const imageFreshness = clamp(Number(input.imageFreshness ?? 70), 0, 100);

  const scoreRaw =
    timeScore * weights.time +
    catFactor * 100 * weights.category +
    storageFactor * 100 * weights.storage +
    tempScore * weights.temp +
    imageFreshness * weights.image;

  const score = clamp(Math.round(scoreRaw), 0, 100);

  const label =
    score >= 75
      ? "Safe"
      : score >= 50
      ? "Use Immediately"
      : "Risky";

  // =========================
  // 🧠 EXPLANATION (KEY USP)
  // =========================
  let reason = [];

  if (prepHours > 4) reason.push("Food is not freshly prepared");
  if (temp > 30) reason.push("High ambient temperature");
  if (imageFreshness < 60) reason.push("Visual freshness is low");

  if (reason.length === 0) {
    reason.push("All safety parameters are within acceptable range");
  }

  const riskFlags = getRiskFlags({
    temp,
    trustScore: score,
    prepHours
  });

  return {
    score,
    label,
    reason,
    riskFlags
  };
}

module.exports = { calculateFoodTrust };