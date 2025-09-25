from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

# Keep general schemas here like Token, TokenData, etc., if needed

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None

class TokenData(BaseModel):
    email: Optional[str] = None

class TransactionBase(BaseModel):
    date: datetime
    merchant: str
    description: Optional[str] = None
    amount: float
    category: str
    source: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(TransactionBase):
    pass

class TransactionInDBBase(TransactionBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class Transaction(TransactionInDBBase):
    pass

class InvestmentBase(BaseModel):
    type: str
    name: str
    units: float
    buy_price: float
    current_price: float

class InvestmentCreate(InvestmentBase):
    pass

class InvestmentUpdate(InvestmentBase):
    pass

class InvestmentInDBBase(InvestmentBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Investment(InvestmentInDBBase):
    pass

class TaxDeductionBase(BaseModel):
    type: str
    amount: float

class TaxDeductionCreate(TaxDeductionBase):
    pass

class TaxDeductionUpdate(TaxDeductionBase):
    pass

class TaxDeductionInDBBase(TaxDeductionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TaxDeduction(TaxDeductionInDBBase):
    pass
