
from pydantic import BaseModel
from typing import List, Optional


class ForecastRequest(BaseModel):
    months: Optional[int] = 6  # Default to 6 months if not specified


class ForecastResult(BaseModel):
    month: str
    income: float
    expenses: float


class ForecastResponse(BaseModel):
    predictions: List[ForecastResult]
