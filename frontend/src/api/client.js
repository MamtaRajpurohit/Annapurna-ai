const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/* ---------------- DONATE ---------------- */
export async function postDonation(payload) {
  try {
    const res = await fetch(`${BASE_URL}/donate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("Donate API error:", data);
      throw new Error(data?.error || "Failed to donate");
    }

    return data;
  } catch (err) {
    console.error("postDonation failed:", err);
    throw err;
  }
}

/* ---------------- MATCHES ---------------- */
export async function getMatches(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();

    const res = await fetch(
      `${BASE_URL}/matches${query ? `?${query}` : ""}`
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("Matches API error:", data);
      throw new Error(data?.error || "Failed to load matches");
    }

    return data;
  } catch (err) {
    console.error("getMatches failed:", err);
    throw err;
  }
}

/* ---------------- ANALYTICS ---------------- */
export async function getAnalytics() {
  try {
    const res = await fetch(`${BASE_URL}/analytics`);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("Analytics API error:", data);
      throw new Error(data?.error || "Failed to load analytics");
    }

    return data;
  } catch (err) {
    console.error("getAnalytics failed:", err);
    throw err;
  }
}

/* ---------------- TRUST SCORE (AI) ---------------- */
export async function getTrustScore(payload) {
  try {
    const res = await fetch(`${BASE_URL}/ai/trust-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("Trust Score API error:", data);
      throw new Error(data?.error || "Failed to score trust");
    }

    return data;
  } catch (err) {
    console.error("getTrustScore failed:", err);
    throw err;
  }
}

/* ---------------- QUALITY CHECK (AI) ---------------- */
export async function getQualityCheck(payload) {
  try {
    const res = await fetch(`${BASE_URL}/ai/quality-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("Quality Check API error:", data);
      throw new Error(data?.error || "Failed quality check");
    }

    return data;
  } catch (err) {
    console.error("getQualityCheck failed:", err);
    throw err;
  }
}