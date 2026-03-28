function computeAnalytics(donations = []) {
  const foodSavedKg = donations.reduce((sum, d) => sum + Number(d.quantityKg || 0), 0);
  const mealsServed = Math.round(foodSavedKg * 2.2);
  const co2ReducedKg = Number((foodSavedKg * 2.5).toFixed(2));

  const cityPulse = ["South District", "East Industrial Zone", "Old Market Belt"];
  const surplusAlerts = cityPulse.map((location, idx) => ({
    location,
    predictedInHours: 2 + idx * 2,
    confidence: 70 + idx * 8
  }));

  return {
    impact: {
      foodSavedKg: Number(foodSavedKg.toFixed(2)),
      mealsServed,
      co2ReducedKg
    },
    surplusAlerts
  };
}

module.exports = { computeAnalytics };