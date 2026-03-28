const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// =========================
// 🤖 AI SURPLUS PREDICTION
// =========================
async function predictSurplus(donations = []) {
  try {
    if (!donations || donations.length === 0) {
      return {
        predictedTime: null,
        confidence: 0,
        reason: "No data available"
      };
    }

    if (!OPENAI_API_KEY) {
      throw new Error("Missing API key");
    }

    // 🔥 Reduce data (important for API)
    const sample = donations.slice(-30).map((d) => ({
      time: d.createdAt,
      quantity: d.quantityKg,
      category: d.category,
      trust: d.trust?.score
    }));

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an AI that predicts food surplus patterns. Respond ONLY in JSON."
          },
          {
            role: "user",
            content: `
Analyze donation history and predict the next likely surplus time.

Return:
{
  "predictedTime": "time range (e.g. 9PM-11PM)",
  "confidence": number (0-100),
  "reason": "short explanation"
}

Data:
${JSON.stringify(sample)}
`
          }
        ],
        max_tokens: 200
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const raw = response.data.choices[0].message.content;

    try {
      return JSON.parse(raw);
    } catch {
      return fallbackPrediction(donations);
    }

  } catch (err) {
    return fallbackPrediction(donations);
  }
}

// =========================
// ⚡ FALLBACK (SMART, NOT DUMB)
// =========================
function fallbackPrediction(donations) {
  const hourFreq = {};

  donations.forEach((d) => {
    const hour = new Date(d.createdAt).getHours();
    hourFreq[hour] = (hourFreq[hour] || 0) + 1;
  });

  let peakHour = 0;
  let max = 0;

  for (let h in hourFreq) {
    if (hourFreq[h] > max) {
      max = hourFreq[h];
      peakHour = h;
    }
  }

  return {
    predictedTime: `${peakHour}:00 - ${Number(peakHour) + 2}:00`,
    confidence: 65,
    reason: "Based on historical peak donation hour (fallback logic)"
  };
}

module.exports = { predictSurplus };