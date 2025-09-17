from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

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
    total_income: float
    total_expenses: float
    deductions_80c: float
    deductions_80d: float
    hra_deduction: float
    investment_deduction: float
    total_deductions: float
    taxable_income: float
    tax_liability: float

class TaxSuggestionResponse(BaseModel):
    suggestions: List[str]

class TaxCalculationRequest(BaseModel):
    income: float
    expenses: float
    deductions: dict
    regime: str

class TaxCalculationResponse(BaseModel):
    taxable_income: float
    tax_liability: float
    tax_liability_without_deductions: float
    tax_savings: float
    regime_better: str
    old_regime_tax_liability: float
    new_regime_tax_liability: float
    deductions_used: dict
