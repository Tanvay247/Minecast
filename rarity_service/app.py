from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from model import compute_rarity_from_cid

app = FastAPI()

class RarityRequest(BaseModel):
    cid: str

class RarityResponse(BaseModel):
    score: float
    label: str


def rarity_label(score: float) -> str:
    if score >= 0.9:
        return "Legendary"
    elif score >= 0.75:
        return "Rare"
    elif score >= 0.5:
        return "Uncommon"
    else:
        return "Common"


@app.post("/rarity", response_model=RarityResponse)
def calculate_rarity(req: RarityRequest):
    try:
        score = compute_rarity_from_cid(req.cid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "score": score,
        "label": rarity_label(score)
    }