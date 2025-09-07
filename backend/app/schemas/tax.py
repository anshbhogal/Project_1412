from pydantic import BaseModel
from datetime import datetime
from typing import List

class TaxDeductionCreate(BaseModel):
    type: str
    amount: float

class TaxDeductionResponse(TaxDeductionCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class TaxSummaryResponse(BaseModel):
    gross_income: float
    deductions: float
    taxable_income: float
    tax_liability: float

class TaxSuggestionResponse(BaseModel):
    suggestions: List[str]
