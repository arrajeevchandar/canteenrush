from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class PredictionRequest(BaseModel):
    vendor_id: int
    items: list[int]

class PredictionResponse(BaseModel):
    predicted_minutes: int

@router.post("/", response_model=PredictionResponse)
def predict_pickup_time(request: PredictionRequest):
    # Mock logic: base 5 mins + 3 mins per item
    # In reality, this would use the ML model
    predicted_time = 5 + (len(request.items) * 3)
    return {"predicted_minutes": predicted_time}
