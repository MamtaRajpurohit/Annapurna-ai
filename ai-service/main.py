from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, timezone

app = FastAPI(title="Annapurna AI Service", version="1.0.0")


class TrustInput(BaseModel):
    preparedAt: Optional[str] = None
    category: Optional[Literal["cooked", "raw", "packaged", "dairy"]] = "cooked"
    storageCondition: Optional[Literal["refrigerated", "room", "insulated"]] = "room"
    temperatureC: Optional[float] = 24
    imageFreshness: Optional[float] = Field(default=70, ge=0, le=100)


class QualityInput(BaseModel):
    imageData: Optional[str] = ""
    imageFreshness: Optional[float] = Field(default=70, ge=0, le=100)


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


@app.get("/health")
def health():
    return {"ok": True, "service": "annapurna-ai-fastapi"}


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


@app.post("/quality-check")
def quality_check(payload: QualityInput):
    image_freshness = payload.imageFreshness or 70
    image_len_hint = len(payload.imageData or "")

    confidence = int(clamp(55 + image_freshness * 0.35 + min(image_len_hint / 4000, 10), 50, 97))
    status = "Fresh" if image_freshness >= 55 else "Possibly spoiled"

    return {"status": status, "confidence": confidence}