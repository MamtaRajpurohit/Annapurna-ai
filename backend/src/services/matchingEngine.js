const ngos = require("../data/ngos");

// =========================
// 📍 DISTANCE
// =========================
function haversineKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) *
      Math.cos(toRad(b.lat)) *
      Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa)));
}

// =========================
// ⏱ ETA
// =========================
function etaMinutes(distanceKm, urgency) {
  const speed =
    urgency === "critical" ? 35 : urgency === "urgent" ? 28 : 22;
  return Math.max(8, Math.round((distanceKm / speed) * 60));
}

// =========================
// 🧠 SCORING ENGINE
// =========================
function scoreNGO(ngo, input) {
  const { donorLocation, quantityKg, trustScore, urgency, ngoTypePreference } = input;

  const distanceKm = Number(
    haversineKm(donorLocation, { lat: ngo.lat, lng: ngo.lng }).toFixed(2)
  );

  const remainingCapacityKg = Math.max(0, ngo.capacityKg - ngo.allocatedKg);

  const capacityFit = Math.min(1, remainingCapacityKg / Math.max(1, quantityKg));

  const typeMatch =
    ngoTypePreference === "general" || ngo.type === ngoTypePreference
      ? 1
      : 0.75;

  const trustPenalty = trustScore < 50 ? 0.65 : 1;

  let score =
    (1 / (1 + distanceKm)) * 45 +
    capacityFit * 35 +
    typeMatch * 20;

  score *= trustPenalty;

  // ⚡ Risk-aware routing
  if (trustScore < 50) {
    score += Math.max(0, 18 - distanceKm);
  }

  if (urgency === "critical") {
    score += Math.max(0, 12 - distanceKm);
  }

  return {
    ngoId: ngo.ngoId,
    ngoName: ngo.ngoName,
    type: ngo.type,
    distanceKm,
    remainingCapacityKg,
    etaMinutes: etaMinutes(distanceKm, urgency),
    fitScore: Number(score.toFixed(2))
  };
}

// =========================
// 🎯 MATCHING + SORTING
// =========================
function matchNGOs(input) {
  const origin = input.donorLocation || { lat: 28.6139, lng: 77.209 };

  const scored = ngos.map((ngo) =>
    scoreNGO(ngo, { ...input, donorLocation: origin })
  );

  return scored.sort((a, b) => b.fitScore - a.fitScore);
}

// =========================
// 🔀 AUTO SPLIT (REAL LOGIC)
// =========================
function allocateDonations(matches, totalQuantity) {
  let remaining = totalQuantity;
  const allocations = [];

  for (let ngo of matches) {
    if (remaining <= 0) break;

    const allocated = Math.min(ngo.remainingCapacityKg, remaining);

    if (allocated > 0) {
      allocations.push({
        ngoId: ngo.ngoId,
        ngoName: ngo.ngoName,
        allocatedKg: Number(allocated.toFixed(2)),
        etaMinutes: ngo.etaMinutes,
        distanceKm: ngo.distanceKm,
      });

      remaining -= allocated;
    }
  }

  return {
    allocations,
    unallocatedKg: Number(remaining.toFixed(2))
  };
}

// =========================
// 🧠 EXPLAINABILITY (VERY IMPORTANT)
// =========================
function generateReason(input, match) {
  if (input.trustScore < 50) {
    return "⚡ High-risk food prioritized to nearest NGO for quick handling";
  }

  if (input.urgency === "critical") {
    return "🚨 Critical urgency → fastest route selected";
  }

  return `📍 ${match.distanceKm}km away • 🏢 Capacity optimized • ⚖️ Best overall match`;
}

// =========================
// 🗺 ROUTE
// =========================
function buildRoute(donorLocation, match) {
  const donor = donorLocation || { lat: 28.6139, lng: 77.209 };

  return {
    etaMinutes: match?.etaMinutes || 20,
    points: [
      { x: 10, y: 80, label: "Donor" },
      { x: 46, y: 56, label: "Transit" },
      { x: 88, y: 24, label: match?.ngoName || "NGO" },
    ],
    pathText: `Donor (${donor.lat.toFixed(
      3
    )}, ${donor.lng.toFixed(3)}) -> ${match?.ngoName || "NGO"}`,
  };
}

module.exports = {
  matchNGOs,
  buildRoute,
  allocateDonations,
  generateReason
};