from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class InvestmentCreate(BaseModel):
    type: str
    name: str
    units: float
    buy_price: float
    current_price: float

class InvestmentResponse(InvestmentCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class InvestmentPerformanceResponse(BaseModel):
    total_invested: float
    current_value: float
    pnl: float
    allocations: Dict[str, float]
