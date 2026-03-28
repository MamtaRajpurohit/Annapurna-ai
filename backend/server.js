const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const { saveDonation, listDonations } = require("./src/firebase");
const { calculateFoodTrust } = require("./src/services/trustEngine");
const { getUrgency } = require("./src/services/urgencyEngine");

const {
  matchNGOs,
  buildRoute,
  allocateDonations,
  generateReason
} = require("./src/services/matchingEngine");

const { computeAnalytics } = require("./src/services/analyticsService");
const { predictSurplus } = require("./src/services/predectiveEngine");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "8mb" }));

const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001";

// =======================
// 🌡️ WEATHER API
// =======================
async function getTemperature(lat, lng) {
  try {
    const res = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
    );
    return res.data.current_weather.temperature;
  } catch {
    return 30;
  }
}

// =======================
// 📦 PACKAGING
// =======================
function getPackagingAdvice({ category, temperatureC }) {
  const advice = [];

  if (category === "cooked") advice.push("Use airtight containers");
  if (category === "dairy") advice.push("Keep below 5°C");

  if (temperatureC > 30) {
    advice.push("Avoid long transport delays");
    advice.push("Use insulated bags");
  }

  return advice;
}

// =======================
// ⚠️ RISK ALERTS
// =======================
function getRiskAlerts({ temperatureC, trustScore }) {
  const alerts = [];

  if (temperatureC > 32) alerts.push("🔥 High temperature → faster spoilage");
  if (trustScore < 50) alerts.push("🚨 Low trust score → donate immediately");
  if (temperatureC > 35 && trustScore < 60) {
    alerts.push("⚠️ Critical spoilage risk due to heat + delay");
  }

  return alerts;
}

// =======================
// 🤖 SAFE AI CALL
// =======================
async function safeCallAI(endpoint, payload, fallbackFn) {
  try {
    const { data } = await axios.post(
      `${AI_SERVICE_URL}${endpoint}`,
      payload,
      { timeout: 5000 }
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
  const data = await safeCallAI("/quality-check", req.body, () => ({
    status: "Unknown",
    confidence: 60,
    freshness: 65
  }));
  res.json(data);
});

// =======================
// 🤖 AI CHATBOT
// =======================
app.post("/chatbot", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-4.1-mini",
        input: message
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply =
      response.data?.output?.[0]?.content?.[0]?.text || "No response";

    res.json({ reply });

  } catch (err) {
    console.error("CHATBOT ERROR:", err.response?.data || err.message);

    const msg = message.toLowerCase();

    let reply = "I'm here to help with food donation! 🍱 (offline mode)";

    if (msg.includes("safe")) {
      reply = "Food safety depends on freshness, temperature, and storage. Try donating within 4–6 hours.";
    } else if (msg.includes("ngo")) {
      reply = "We match NGOs based on distance, urgency, and capacity.";
    } else if (msg.includes("trust")) {
      reply = "Trust score is calculated using AI freshness, time, and conditions.";
    } else if (msg.includes("urgent")) {
      reply = "Urgent food should be donated immediately to the nearest NGO.";
    }

    res.json({ reply });
  }
});

// =======================
// 🚀 DONATION FLOW
// =======================
app.post("/donate", async (req, res) => {
  try {
    const payload = req.body || {};

    // ✅ Validation
    if (!payload.quantityKg || !payload.category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const lat = payload.location?.lat ?? 28.61;
    const lng = payload.location?.lng ?? 77.20;

    // 🌡️ Weather
    const temp = await getTemperature(lat, lng);
    payload.temperatureC = temp;

    // 🤖 QUALITY AI
    const quality = await safeCallAI("/quality-check", payload, () => ({
      status: "Unknown",
      confidence: 60,
      freshness: 65
    }));

    payload.imageFreshness = quality.freshness;

    // 🤖 TRUST AI
    const trust = await safeCallAI("/trust-score", payload, calculateFoodTrust);

    const trustScoreValue = trust.score ?? trust.trustScore ?? 70;

    // ⚡ URGENCY
    const urgency = getUrgency({
      expiryAt: payload.expiryAt,
      trustScore: trustScoreValue,
      category: payload.category
    });

    // 🎯 MATCHING
    const matches = matchNGOs({
      donorLocation: { lat, lng },
      quantityKg: payload.quantityKg,
      trustScore: trustScoreValue,
      urgency,
      ngoTypePreference: payload.ngoTypePreference
    });

    const bestMatch = matches[0];

    const allocation = allocateDonations(matches, payload.quantityKg);

    const reason = generateReason(
      { trustScore: trustScoreValue, urgency },
      bestMatch
    );

    const route = buildRoute({ lat, lng }, bestMatch);

    const advice = getPackagingAdvice({
      category: payload.category,
      temperatureC: temp
    });

    const alerts = getRiskAlerts({
      temperatureC: temp,
      trustScore: trustScoreValue
    });

    // 🧾 SAVE
    const donation = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      donorName: payload.donorName || "Anonymous Donor",
      category: payload.category,
      quantityKg: Number(payload.quantityKg),
      preparedAt: payload.preparedAt,
      expiryAt: payload.expiryAt,
      storageCondition: payload.storageCondition || "room",
      temperatureC: temp,
      imageFreshness: payload.imageFreshness,
      location: { lat, lng },
      trust,
      quality,
      urgency,
      bestMatch,
      allocations: allocation.allocations,
      route,
      advice,
      alerts,
      reason
    };

    try {
      await saveDonation(donation);
    } catch (firebaseErr) {
      console.error("🔥 FIREBASE ERROR:", firebaseErr.message);
      // Don't crash — still return the result
    }

    res.status(201).json({
      message: "Donation processed successfully",
      donationId: donation.id,
      trust,
      quality,
      urgency,
      bestMatch,
      allocations: allocation.allocations,
      unallocated: allocation.unallocatedKg,
      matches: matches.slice(0, 3),
      route,
      advice,
      alerts,
      reason
    });

  } catch (error) {
    console.error("💥 DONATE ROUTE ERROR:", error.message);
    console.error("💥 STACK:", error.stack);
    res.status(500).json({
      error: "Donation failed",
      detail: error.message
    });
  }
}); // ✅ FIX: This closing }); was missing — routes below were inside the donate handler

// =======================
// MATCHES
// =======================
app.get("/matches", (req, res) => {
  const lat = Number(req.query.lat || 28.6139);
  const lng = Number(req.query.lng || 77.209);
  const trustScore = Number(req.query.trustScore || 70);
  const urgency = String(req.query.urgency || "normal");
  const quantityKg = Number(req.query.quantityKg || 10);

  const matches = matchNGOs({
    donorLocation: { lat, lng },
    trustScore,
    urgency,
    quantityKg,
    ngoTypePreference: req.query.ngoTypePreference
  });

  res.json({ matches });
});

// =======================
// 📊 ANALYTICS + AI PREDICTION
// =======================
app.get("/analytics", async (_req, res) => {
  try {
    const donations = await listDonations();

    const analytics = await computeAnalytics(donations);
    const prediction = await predictSurplus(donations);

    res.json({
      ...analytics,
      surplusPrediction: prediction
    });

  } catch (error) {
    res.status(500).json({
      error: "Analytics failed",
      detail: error.message
    });
  }
});

// =======================
// HEALTH
// =======================
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "annapurna-backend" });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});