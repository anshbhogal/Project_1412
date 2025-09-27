
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..schemas.forecasting import ForecastRequest, ForecastResponse, ForecastResult
from ..services.forecasting_service import generate_financial_forecast
from ..database import get_db
from ..utils.auth import get_current_user

router = APIRouter()

@router.post("/predict", response_model=ForecastResponse)
def predict_forecast(
    request: ForecastRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    try:
        forecast_data = generate_financial_forecast(db, user["id"], request.months)
        return ForecastResponse(predictions=forecast_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
