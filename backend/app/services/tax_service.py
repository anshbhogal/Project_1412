from sqlalchemy.orm import Session
from typing import List

from .. import schemas
from ..models.models import Transaction, TaxDeduction # Updated import
from ..config import settings

def get_user_transactions(db: Session, user_id: int):
    return db.query(Transaction).filter(Transaction.user_id == user_id).all()

def get_user_tax_deductions(db: Session, user_id: int):
    return db.query(TaxDeduction).filter(TaxDeduction.user_id == user_id).all()

def calculate_tax_summary(db: Session, user_id: int) -> schemas.tax.TaxSummaryResponse:
    transactions = get_user_transactions(db, user_id)
    all_deductions = get_user_tax_deductions(db, user_id)

    total_income = sum(t.amount for t in transactions if t.amount > 0)
    total_expenses = sum(abs(t.amount) for t in transactions if t.amount < 0)

    deductions_80c = sum(d.amount for d in all_deductions if d.type == "80C")
    deductions_80d = sum(d.amount for d in all_deductions if d.type == "80D")
    hra_deduction = sum(d.amount for d in all_deductions if d.type == "HRA")
    investment_deduction = sum(d.amount for d in all_deductions if d.type == "Investment")
    
    # For simplicity, let's cap 80C here (as per old regime rules often)
    actual_80c_deduction = min(deductions_80c, settings.TAX_80C_CAP)

    # Example: Simple standard deduction. This would be more complex with regimes.
    standard_deduction = settings.TAX_STANDARD_DEDUCTION

    total_deductions = actual_80c_deduction + deductions_80d + hra_deduction + investment_deduction + standard_deduction
    
    taxable_income = total_income - total_expenses - total_deductions
    if taxable_income < 0:
        taxable_income = 0

    # Simplified tax liability calculation (this would also need to account for regimes)
    tax_liability = 0.0
    remaining_taxable_income = taxable_income

    for slab in settings.TAX_SLABS:
        if remaining_taxable_income <= 0:
            break

        slab_limit = slab["limit"]
        slab_rate = slab["rate"]

        if slab_limit == float('inf'):  # Last slab
            tax_liability += remaining_taxable_income * slab_rate
            remaining_taxable_income = 0
        elif remaining_taxable_income > slab_limit - settings.TAX_BASIC_EXEMPTION_LIMIT:
            income_in_slab = min(remaining_taxable_income, slab_limit - settings.TAX_BASIC_EXEMPTION_LIMIT)
            tax_liability += income_in_slab * slab_rate
            remaining_taxable_income -= income_in_slab

    return schemas.tax.TaxSummaryResponse(
        total_income=total_income,
        total_expenses=total_expenses,
        deductions_80c=deductions_80c,
        deductions_80d=deductions_80d,
        hra_deduction=hra_deduction,
        investment_deduction=investment_deduction,
        total_deductions=total_deductions,
        taxable_income=taxable_income,
        tax_liability=tax_liability
    )

def create_tax_deduction(db: Session, deduction: schemas.tax.TaxDeductionCreate, user_id: int):
    db_deduction = TaxDeduction(**deduction.dict(), user_id=user_id) # Changed from models.TaxDeduction
    db.add(db_deduction)
    db.commit()
    db.refresh(db_deduction)
    return db_deduction

def get_tax_suggestions(db: Session, user_id: int) -> schemas.tax.TaxSuggestionResponse:
    summary = calculate_tax_summary(db, user_id)
    suggestions = []

    # Section 80C suggestions
    deductions_80c = get_user_tax_deductions(db, user_id)
    total_80c_deductions = sum(d.amount for d in deductions_80c)

    if total_80c_deductions < settings.TAX_80C_CAP:
        remaining_80c_limit = settings.TAX_80C_CAP - total_80c_deductions
        suggestions.append(f"Invest up to ₹{remaining_80c_limit:.0f} in Section 80C instruments (PPF, ELSS, Insurance).")
    
    # Example: NPS (Section 80CCD(1B)) suggestion
    suggestions.append("Consider NPS contributions under Section 80CCD(1B) for an extra ₹50,000 deduction.")

    return schemas.tax.TaxSuggestionResponse(suggestions=suggestions)
