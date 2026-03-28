from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, timezone
import os
import json
from openai import OpenAI

app = FastAPI(title="Annapurna AI Service", version="2.0.0")

# =========================
# 🔑 OPENAI SETUP
# =========================
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# =========================
# 📦 MODELS
# =========================
class TrustInput(BaseModel):
    preparedAt: Optional[str] = None
    category: Optional[Literal["cooked", "raw", "packaged", "dairy"]] = "cooked"
    storageCondition: Optional[Literal["refrigerated", "room", "insulated"]] = "room"
    temperatureC: Optional[float] = 24
    imageFreshness: Optional[float] = Field(default=70, ge=0, le=100)


class QualityInput(BaseModel):
    imageData: Optional[str] = ""


# =========================
# 🧮 HELPERS
# =========================
def clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def hours_since(iso_time: Optional[str]) -> float:
    if not iso_time:
        return 4.0
    try:
        parsed = datetime.fromisoformat(iso_time.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        diff_h = (datetime.now(timezone.utc) - parsed).total_seconds() / 3600
        return clamp(diff_h, 0, 48)
    except Exception:
        return 6.0


# =========================
# ❤️ HEALTH
# =========================
@app.get("/health")
def health():
    return {"ok": True, "service": "annapurna-ai-fastapi"}


# =========================
# 🧠 TRUST SCORE
# =========================
@app.post("/trust-score")
def trust_score(payload: TrustInput):
    category_risk = {"cooked": 1.0, "dairy": 0.85, "raw": 0.75, "packaged": 0.65}
    storage_boost = {"refrigerated": 1.0, "insulated": 0.88, "room": 0.70}

    prep_hours = hours_since(payload.preparedAt)
    time_score = clamp(100 - prep_hours * 3.5, 20, 100)
    temp_score = clamp(100 - max(0, (payload.temperatureC or 24) - 5) * 2.8, 20, 100)
    image_fresh = clamp(payload.imageFreshness or 70, 0, 100)

    score_raw = (
        time_score * 0.28
        + category_risk.get(payload.category or "cooked", 0.8) * 100 * 0.2
        + storage_boost.get(payload.storageCondition or "room", 0.75) * 100 * 0.2
        + temp_score * 0.17
        + image_fresh * 0.15
    )

    score = int(clamp(round(score_raw), 0, 100))
    label = "Safe" if score >= 75 else "Use Immediately" if score >= 50 else "Risky"

    return {"score": score, "label": label}


# =========================
# 🤖 REAL AI QUALITY CHECK
# =========================
@app.post("/quality-check")
def quality_check(payload: QualityInput):
    try:
        if not payload.imageData:
            raise ValueError("No image provided")

        # Extract base64
        image_base64 = payload.imageData.split(",")[-1]

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a food quality inspection AI. Always respond ONLY in JSON."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """
Analyze this food image and return:
{
  "freshness_score": number (0-100),
  "status": "Fresh" or "Possibly spoiled",
  "confidence": number (0-100),
  "reason": "short explanation"
}
"""
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=300
        )

        raw_output = response.choices[0].message.content

        # Try parsing JSON safely
        try:
            parsed = json.loads(raw_output)
        except:
            # fallback parsing
            parsed = {
                "freshness_score": 65,
                "status": "Unknown",
                "confidence": 60,
                "reason": raw_output[:100]
            }

        return {
            "status": parsed.get("status", "Unknown"),
            "confidence": int(parsed.get("confidence", 60)),
            "freshness": int(parsed.get("freshness_score", 65)),
            "reason": parsed.get("reason", "AI analysis")
        }

    except Exception as e:
        return {
            "status": "Unknown",
            "confidence": 50,
            "freshness": 60,
            "reason": "Fallback used",
            "error": str(e)
        }