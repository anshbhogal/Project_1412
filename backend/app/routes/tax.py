from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
import os

from .. import schemas
from ..models.models import Transaction as ModelTransaction, TaxDeduction as ModelTaxDeduction, User as ModelUser
from ..dependencies import get_db, get_current_user
from ..services import tax_service
from ..schemas.user import UserResponse
from ..schemas.tax import TaxCalculationRequest, TaxCalculationResponse
from ..services.tax_service import generate_tax_report_pdf, generate_tax_report_csv
from fastapi.responses import StreamingResponse
from typing import Optional

router = APIRouter()

@router.get("/summary", response_model=schemas.tax.TaxSummaryResponse)
def get_tax_summary(db: Session = Depends(get_db), current_user: UserResponse = Depends(get_current_user)):
    return tax_service.calculate_tax_summary(db, current_user.id)

@router.post("/deductions", response_model=schemas.tax.TaxDeductionResponse)
def create_deduction(deduction: schemas.tax.TaxDeductionCreate, db: Session = Depends(get_db), current_user: UserResponse = Depends(get_current_user)):
    return tax_service.create_tax_deduction(db, deduction, current_user.id)

@router.get("/suggestions", response_model=schemas.tax.TaxSuggestionResponse)
def get_suggestions(db: Session = Depends(get_db), current_user: UserResponse = Depends(get_current_user)):
    return tax_service.get_tax_suggestions(db, current_user.id)

@router.get("/slabs", response_model=dict)
def get_tax_slabs(country: str = "india", regime: str = "old"):
    script_dir = os.path.dirname(__file__)
    parent_dir = os.path.dirname(script_dir)
    slabs_file_path = os.path.join(parent_dir, "tax", "slabs.json")

    if not os.path.exists(slabs_file_path):
        raise HTTPException(status_code=404, detail="Tax slabs file not found")

    with open(slabs_file_path, "r") as f:
        slabs_data = json.load(f)

    if country.lower() not in slabs_data:
        raise HTTPException(status_code=404, detail=f"Tax slabs for country {country} not found")

    if regime.lower() not in slabs_data[country.lower()]:
        raise HTTPException(status_code=404, detail=f"Tax regime {regime} for country {country} not found")

    return slabs_data[country.lower()][regime.lower()]

@router.post("/calculate", response_model=TaxCalculationResponse)
def calculate_tax_route(
    request: TaxCalculationRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    script_dir = os.path.dirname(__file__)
    parent_dir = os.path.dirname(script_dir)
    slabs_file_path = os.path.join(parent_dir, "tax", "slabs.json")

    if not os.path.exists(slabs_file_path):
        raise HTTPException(status_code=404, detail="Tax slabs file not found")

    with open(slabs_file_path, "r") as f:
        slabs_data = json.load(f)

    return tax_service.calculate_tax(request.income, request.expenses, request.deductions, request.regime, slabs_data)

@router.get("/report", response_class=StreamingResponse)
def get_tax_report(
    report_type: str, 
    country: str = "india", 
    regime: str = "old",
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    summary_data = tax_service.calculate_tax_summary(db, current_user.id).dict()

    if report_type.lower() == "pdf":
        pdf_buffer = generate_tax_report_pdf(summary_data)
        return StreamingResponse(pdf_buffer, media_type="application/pdf", headers={
            "Content-Disposition": "attachment; filename=\"tax_summary.pdf\"
        })
    elif report_type.lower() == "csv":
        csv_buffer = generate_tax_report_csv(summary_data)
        return StreamingResponse(csv_buffer, media_type="text/csv", headers={
            "Content-Disposition": "attachment; filename=\"tax_summary.csv\"
        })
    else:
        raise HTTPException(status_code=400, detail="Invalid report type. Choose 'pdf' or 'csv'.")
