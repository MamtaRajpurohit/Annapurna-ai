const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export async function postDonation(payload) {
  const res = await fetch(`${BASE_URL}/donate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to donate");
  return res.json();
}

export async function getMatches(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/matches${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Failed to load matches");
  return res.json();
}

export async function getAnalytics() {
  const res = await fetch(`${BASE_URL}/analytics`);
  if (!res.ok) throw new Error("Failed to load analytics");
  return res.json();
}

export async function getTrustScore(payload) {
  const res = await fetch(`${BASE_URL}/ai/trust-score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to score trust");
  return res.json();
}

export async function getQualityCheck(payload) {
  const res = await fetch(`${BASE_URL}/ai/quality-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed quality check");
  return res.json();
}


// ==========================
// 🔥 NEW: PREDICTIVE API
// ==========================

export async function getPrediction() {
  const res = await fetch(`${BASE_URL}/predict`);
  if (!res.ok) throw new Error("Failed to load prediction");
  return res.json();
}