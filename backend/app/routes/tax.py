from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, models
from ..database import get_db
from ..utils.auth import get_current_user
from ..services import tax_service

router = APIRouter()

@router.get("/summary", response_model=schemas.tax.TaxSummaryResponse)
def get_tax_summary(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return tax_service.calculate_tax_summary(db, current_user.id)

@router.post("/deductions", response_model=schemas.tax.TaxDeductionResponse)
def create_deduction(deduction: schemas.tax.TaxDeductionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return tax_service.create_tax_deduction(db, deduction, current_user.id)

@router.get("/suggestions", response_model=schemas.tax.TaxSuggestionResponse)
def get_suggestions(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return tax_service.get_tax_suggestions(db, current_user.id)
