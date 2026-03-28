const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const { saveDonation, listDonations } = require("./src/firebase");
const { calculateFoodTrust } = require("./src/services/trustEngine");
const { getUrgency } = require("./src/services/urgencyEngine");
const { matchNGOs, buildRoute } = require("./src/services/matchingEngine");
const { computeAnalytics } = require("./src/services/analyticsService");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "8mb" }));

const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001";


// =======================
// 🌡️ WEATHER API FUNCTION
// =======================
async function getTemperature(lat, lng) {
  try {
    const res = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
    );
    return res.data.current_weather.temperature;
  } catch {
    return 30; // fallback
  }
}


// =======================
// 📦 PACKAGING ADVICE (IMPROVED)
// =======================
function getPackagingAdvice({ category, temperatureC }) {
  const advice = [];

  if (category === "cooked") {
    advice.push("Use airtight containers");
  }

  if (category === "dairy") {
    advice.push("Keep below 5°C");
  }

  if (temperatureC > 30) {
    advice.push("Avoid long transport delays");
    advice.push("Use insulated bags");
  }

  return advice;
}


// =======================
// ⚠️ RISK ALERTS (IMPROVED)
// =======================
function getRiskAlerts({ temperatureC, trustScore }) {
  const alerts = [];

  if (temperatureC > 32) {
    alerts.push("🔥 High temperature → faster spoilage");
  }

  if (trustScore < 50) {
    alerts.push("🚨 Low trust score → donate immediately");
  }

  if (temperatureC > 35 && trustScore < 60) {
    alerts.push("⚠️ Critical spoilage risk due to heat + delay");
  }

  return alerts;
}


// =======================
// AI SAFE CALL WRAPPER
// =======================
async function safeCallAI(endpoint, payload, fallbackFn) {
  try {
    const { data } = await axios.post(
      `${AI_SERVICE_URL}${endpoint}`,
      payload,
      { timeout: 2500 }
    );
    return data;
  } catch {
    return fallbackFn(payload);
  }
}


// =======================
// ROUTES
// =======================

// AI trust
app.post("/ai/trust-score", async (req, res) => {
  const data = await safeCallAI("/trust-score", req.body, calculateFoodTrust);
  res.json(data);
});

// AI quality
app.post("/ai/quality-check", async (req, res) => {
  const data = await safeCallAI("/quality-check", req.body, (body) => ({
    status:
      (body.imageFreshness || 70) >= 55
        ? "Fresh"
        : "Possibly spoiled",
    confidence: Math.max(
      50,
      Math.min(96, Math.round((body.imageFreshness || 70) * 0.95))
    )
  }));
  res.json(data);
});


// =======================
// 🚀 DONATION ENDPOINT
// =======================
app.post("/donate", async (req, res) => {
  try {
    const payload = req.body || {};

    // ✅ SAFE LOCATION HANDLING
    const lat = payload.location?.lat || 28.61;
    const lng = payload.location?.lng || 77.20;

    // 🌡️ Get live temperature
    const temp = await getTemperature(lat, lng);
    payload.temperatureC = temp;

    // 🤖 AI + fallback
    const trust = await safeCallAI("/trust-score", payload, calculateFoodTrust);

    const quality = await safeCallAI("/quality-check", payload, () => ({
      status:
        (payload.imageFreshness || 70) >= 55
          ? "Fresh"
          : "Possibly spoiled",
      confidence: 76
    }));

    // ⚡ urgency
    const urgency = getUrgency({
      expiryAt: payload.expiryAt,
      trustScore: trust.score
    });

    // 🤝 matching
    const matches = matchNGOs({
      donorLocation: { lat, lng },
      quantityKg: payload.quantityKg,
      trustScore: trust.score,
      urgency,
      ngoTypePreference: payload.ngoTypePreference
    });

    const match = matches[0];
    const route = buildRoute({ lat, lng }, match);

    // 📦 Advice + ⚠️ Alerts
    const advice = getPackagingAdvice({
      category: payload.category,
      temperatureC: payload.temperatureC
    });

    const alerts = getRiskAlerts({
      temperatureC: payload.temperatureC,
      trustScore: trust.score
    });

    // 🧾 Donation object
    const donation = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      donorName: payload.donorName || "Anonymous Donor",
      category: payload.category || "cooked",
      quantityKg: Number(payload.quantityKg || 0),
      preparedAt: payload.preparedAt,
      expiryAt: payload.expiryAt,
      storageCondition: payload.storageCondition || "room",
      temperatureC: payload.temperatureC,
      imageFreshness: Number(payload.imageFreshness || 70),
      location: { lat, lng },
      trust,
      quality,
      urgency,
      match,
      route,
      advice,
      alerts
    };

    await saveDonation(donation);

    // ✅ FINAL RESPONSE
    res.status(201).json({
      message: "Donation processed successfully",
      donationId: donation.id,
      trust,
      quality,
      urgency,
      matches: matches.slice(0, 3),
      route,
      advice,
      alerts
    });

  } catch (error) {
    res.status(500).json({
      error: "Donation failed",
      detail: error.message
    });
  }
});


// =======================
// MATCHES
// =======================
app.get("/matches", (req, res) => {
  const lat = Number(req.query.lat || 28.6139);
  const lng = Number(req.query.lng || 77.209);
  const trustScore = Number(req.query.trustScore || 70);
  const urgency = String(req.query.urgency || "normal");
  const quantityKg = Number(req.query.quantityKg || 10);
  const ngoTypePreference = String(
    req.query.ngoTypePreference || "general"
  );

  const matches = matchNGOs({
    donorLocation: { lat, lng },
    trustScore,
    urgency,
    quantityKg,
    ngoTypePreference
  });

  res.json({ matches });
});


// =======================
// ANALYTICS
// =======================
app.get("/analytics", async (_req, res) => {
  try {
    const donations = await listDonations();
    const analytics = computeAnalytics(donations);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({
      error: "Analytics failed",
      detail: error.message
    });
  }
});


// =======================
// HEALTH CHECK
// =======================
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "annapurna-backend" });
});


// =======================
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});