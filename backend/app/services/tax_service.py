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

def calculate_tax(income: float, expenses: float, deductions_input: dict, regime: str, slabs_data: dict) -> schemas.tax.TaxCalculationResponse:
    # Define deduction caps
    DEDUCTION_CAPS = {
        "80C": 150000,
        "80D": {"default": 25000, "senior": 50000},  # Assuming default for now, can be expanded
        "80CCD(1B)": 50000, # NPS
        "24b": 200000, # Home Loan Interest
        "80G": float('inf') # No direct cap, but percentage limits apply, simplifying for now
    }

    deductions_used = {
        "80C": 0,
        "80D": 0,
        "HRA": 0,
        "home_loan": 0,
        "NPS": 0,
        "donations": 0
    }

    # Apply statutory caps to deductions
    deductions_used["80C"] = min(deductions_input.get("80C", 0), DEDUCTION_CAPS["80C"])
    deductions_used["80D"] = min(deductions_input.get("80D", 0), DEDUCTION_CAPS["80D"]["default"])
    deductions_used["HRA"] = deductions_input.get("HRA", 0) # HRA calculation is complex, keeping it simple for now
    deductions_used["home_loan"] = min(deductions_input.get("home_loan", 0), DEDUCTION_CAPS["24b"])
    deductions_used["NPS"] = min(deductions_input.get("NPS", 0), DEDUCTION_CAPS["80CCD(1B)"])
    deductions_used["donations"] = deductions_input.get("donations", 0) # Simplifying 80G for now

    total_deductions = sum(deductions_used.values())

    # Calculate taxable income
    taxable_income = income - expenses - total_deductions
    if taxable_income < 0:
        taxable_income = 0

    tax_liability = 0.0
    regime_slabs = slabs_data.get("india", {}).get(regime.lower(), [])

    for slab in regime_slabs:
        min_income = slab["min_income"]
        max_income = slab["max_income"]
        tax_rate = slab["tax_rate"]

        if taxable_income > min_income:
            income_in_slab = min(taxable_income, max_income) - min_income
            tax_liability += income_in_slab * tax_rate

    # Calculate tax liability without deductions for comparison
    taxable_income_without_deductions = income - expenses
    if taxable_income_without_deductions < 0:
        taxable_income_without_deductions = 0

    tax_liability_without_deductions = 0.0
    for slab in regime_slabs:
        min_income = slab["min_income"]
        max_income = slab["max_income"]
        tax_rate = slab["tax_rate"]

        if taxable_income_without_deductions > min_income:
            income_in_slab = min(taxable_income_without_deductions, max_income) - min_income
            tax_liability_without_deductions += income_in_slab * tax_rate

    tax_savings = tax_liability_without_deductions - tax_liability

    # Compare regimes (simplified, assuming we calculate both for comparison)
    old_regime_slabs = slabs_data.get("india", {}).get("old_regime", [])
    new_regime_slabs = slabs_data.get("india", {}).get("new_regime", [])

    old_regime_tax_liability = 0.0
    new_regime_tax_liability = 0.0

    # Calculate old regime tax liability with deductions
    old_regime_taxable_income = income - expenses - total_deductions # Assuming same deductions for comparison
    if old_regime_taxable_income < 0:
        old_regime_taxable_income = 0

    for slab in old_regime_slabs:
        min_income = slab["min_income"]
        max_income = slab["max_income"]
        tax_rate = slab["tax_rate"]

        if old_regime_taxable_income > min_income:
            income_in_slab = min(old_regime_taxable_income, max_income) - min_income
            old_regime_tax_liability += income_in_slab * tax_rate

    # Calculate new regime tax liability without most deductions (standard deduction only for new regime)
    # Note: New regime generally has no 80C, 80D, HRA deductions, but has a standard deduction
    new_regime_total_deductions = 0 # Most common scenario for new regime
    new_regime_taxable_income = income - expenses - new_regime_total_deductions
    if new_regime_taxable_income < 0:
        new_regime_taxable_income = 0

    for slab in new_regime_slabs:
        min_income = slab["min_income"]
        max_income = slab["max_income"]
        tax_rate = slab["tax_rate"]

        if new_regime_taxable_income > min_income:
            income_in_slab = min(new_regime_taxable_income, max_income) - min_income
            new_regime_tax_liability += income_in_slab * tax_rate

    regime_better = "Old Regime" if old_regime_tax_liability < new_regime_tax_liability else "New Regime"

    return schemas.tax.TaxCalculationResponse(
        taxable_income=taxable_income,
        tax_liability=tax_liability,
        tax_liability_without_deductions=tax_liability_without_deductions,
        tax_savings=tax_savings,
        regime_better=regime_better,
        old_regime_tax_liability=old_regime_tax_liability,
        new_regime_tax_liability=new_regime_tax_liability,
        deductions_used=deductions_used
    )