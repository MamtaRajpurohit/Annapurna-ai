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

async function safeCallAI(endpoint, payload, fallbackFn) {
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}${endpoint}`, payload, { timeout: 2500 });
    return data;
  } catch {
    return fallbackFn(payload);
  }
}

app.post("/ai/trust-score", async (req, res) => {
  const data = await safeCallAI("/trust-score", req.body, calculateFoodTrust);
  res.json(data);
});

app.post("/ai/quality-check", async (req, res) => {
  const data = await safeCallAI("/quality-check", req.body, (body) => ({
    status: (body.imageFreshness || 70) >= 55 ? "Fresh" : "Possibly spoiled",
    confidence: Math.max(50, Math.min(96, Math.round((body.imageFreshness || 70) * 0.95)))
  }));
  res.json(data);
});

app.post("/donate", async (req, res) => {
  try {
    const payload = req.body || {};
    const trust = await safeCallAI("/trust-score", payload, calculateFoodTrust);
    const quality = await safeCallAI("/quality-check", payload, () => ({
      status: (payload.imageFreshness || 70) >= 55 ? "Fresh" : "Possibly spoiled",
      confidence: 76
    }));

    const urgency = getUrgency({ expiryAt: payload.expiryAt, trustScore: trust.score });
    const matches = matchNGOs({
      donorLocation: payload.location,
      quantityKg: payload.quantityKg,
      trustScore: trust.score,
      urgency,
      ngoTypePreference: payload.ngoTypePreference
    });

    const match = matches[0];
    const route = buildRoute(payload.location, match);

    const donation = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      donorName: payload.donorName || "Anonymous Donor",
      category: payload.category || "cooked",
      quantityKg: Number(payload.quantityKg || 0),
      preparedAt: payload.preparedAt,
      expiryAt: payload.expiryAt,
      storageCondition: payload.storageCondition || "room",
      temperatureC: Number(payload.temperatureC || 25),
      imageFreshness: Number(payload.imageFreshness || 70),
      location: payload.location || { lat: 28.6139, lng: 77.209 },
      trust,
      quality,
      urgency,
      match,
      route
    };

    await saveDonation(donation);

    res.status(201).json({
      message: "Donation processed successfully",
      donationId: donation.id,
      trust,
      quality,
      urgency,
      match,
      route
    });
  } catch (error) {
    res.status(500).json({ error: "Donation failed", detail: error.message });
  }
});

app.get("/matches", (req, res) => {
  const lat = Number(req.query.lat || 28.6139);
  const lng = Number(req.query.lng || 77.209);
  const trustScore = Number(req.query.trustScore || 70);
  const urgency = String(req.query.urgency || "normal");
  const quantityKg = Number(req.query.quantityKg || 10);
  const ngoTypePreference = String(req.query.ngoTypePreference || "general");

  const matches = matchNGOs({
    donorLocation: { lat, lng },
    trustScore,
    urgency,
    quantityKg,
    ngoTypePreference
  });

  res.json({ matches });
});

app.get("/analytics", async (_req, res) => {
  try {
    const donations = await listDonations();
    const analytics = computeAnalytics(donations);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: "Analytics failed", detail: error.message });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "annapurna-backend" });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});