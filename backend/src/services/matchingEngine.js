const ngos = require("../data/ngos");

function haversineKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa)));
}

function etaMinutes(distanceKm, urgency) {
  const speed = urgency === "critical" ? 35 : urgency === "urgent" ? 28 : 22;
  return Math.max(8, Math.round((distanceKm / speed) * 60));
}

function matchNGOs({ donorLocation, quantityKg = 0, trustScore = 70, urgency = "normal", ngoTypePreference = "general" }) {
  const origin = donorLocation || { lat: 28.6139, lng: 77.209 };

  const mapped = ngos.map((ngo) => {
    const distanceKm = Number(haversineKm(origin, { lat: ngo.lat, lng: ngo.lng }).toFixed(2));
    const remainingCapacityKg = Math.max(0, ngo.capacityKg - ngo.allocatedKg);
    const capacityFit = Math.min(1, remainingCapacityKg / Math.max(1, quantityKg));
    const typeMatch = ngoTypePreference === "general" || ngo.type === ngoTypePreference ? 1 : 0.75;
    const trustPenalty = trustScore < 50 ? 0.65 : 1;

    let fitScore = (1 / (1 + distanceKm)) * 45 + capacityFit * 35 + typeMatch * 20;
    fitScore *= trustPenalty;

    if (trustScore < 50) {
      fitScore += Math.max(0, 18 - distanceKm); // prioritize nearest for high-risk
    }
    if (urgency === "critical") {
      fitScore += Math.max(0, 12 - distanceKm);
    }

    return {
      ngoId: ngo.ngoId,
      ngoName: ngo.ngoName,
      type: ngo.type,
      distanceKm,
      remainingCapacityKg,
      etaMinutes: etaMinutes(distanceKm, urgency),
      fitScore: Number(fitScore.toFixed(2)),
      reason:
        trustScore < 50
          ? "High-risk food prioritized to nearest capable NGO"
          : "Balanced for distance, capacity, and NGO fit"
    };
  });

  return mapped.sort((a, b) => b.fitScore - a.fitScore);
}

function buildRoute(donorLocation, match) {
  const donor = donorLocation || { lat: 28.6139, lng: 77.209 };
  const xBase = 10;
  const yBase = 80;

  return {
    etaMinutes: match?.etaMinutes || 20,
    points: [
      { x: xBase, y: yBase, label: "Donor" },
      { x: 46, y: 56, label: "Transit" },
      { x: 88, y: 24, label: match?.ngoName || "NGO" }
    ],
    pathText: `Donor (${donor.lat.toFixed(3)}, ${donor.lng.toFixed(3)}) -> ${match?.ngoName || "NGO"}`
  };
}

module.exports = { matchNGOs, buildRoute };