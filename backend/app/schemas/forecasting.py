
from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class ForecastRequest(BaseModel):
    months: Optional[int] = 6  # Default to 6 months if not specified


class ForecastResponse(BaseModel):
    month: str  # Format: YYYY-MM
    predicted_value: float


class ForecastResponseList(BaseModel):
    forecasts: List[ForecastResponse]
