from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from collections import defaultdict

from ..models.models import Transaction, Investment, TaxDeduction

def get_financial_summary(
    db: Session,
    user_id: int,
    start_date: datetime,
    end_date: datetime
):
    # Ensure date range is provided
    if not start_date or not end_date:
        raise ValueError("start_date and end_date must be provided.")

    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).all()

    total_income = sum(t.amount for t in transactions if t.amount > 0)
    total_expenses = sum(t.amount for t in transactions if t.amount < 0)
    net_savings = total_income + total_expenses  # expenses are negative, so add them

    # Investment Value - now filtered by date
    investments = db.query(Investment).filter(
        Investment.user_id == user_id,
        Investment.created_at >= start_date,
        Investment.created_at <= end_date
    ).all()
    investment_value = sum(inv.current_price * inv.units for inv in investments)

    # Tax Liability - now filtered by date
    tax_deductions = db.query(TaxDeduction).filter(
        TaxDeduction.user_id == user_id,
        TaxDeduction.created_at >= start_date,
        TaxDeduction.created_at <= end_date
    ).all()
    tax_liability = sum(td.amount for td in tax_deductions) # This is a placeholder, real tax calc is complex

    # Chart Data: Monthly Income vs Expenses
    monthly_data = defaultdict(lambda: {"income": 0.0, "expenses": 0.0})
    for t in transactions:
        month_year = t.date.strftime("%Y-%m")
        if t.amount > 0:
            monthly_data[month_year]["income"] += t.amount
        else:
            monthly_data[month_year]["expenses"] += abs(t.amount)

    income_vs_expenses_chart_data = [
        {"date": k, "income": v["income"], "expenses": v["expenses"]}
        for k, v in sorted(monthly_data.items())
    ]

    # Chart Data: Expense Breakdown
    expense_breakdown = defaultdict(float)
    for t in transactions:
        if t.amount < 0:
            expense_breakdown[t.category] += abs(t.amount)

    expense_breakdown_chart_data = [
        {"name": k, "value": v}
        for k, v in expense_breakdown.items()
    ]

    return {
        "total_income": total_income,
        "total_expenses": abs(total_expenses), # Return as positive for display
        "net_savings": net_savings,
        "investment_value": investment_value,
        "tax_liability": tax_liability,
        "income_vs_expenses_chart_data": income_vs_expenses_chart_data,
        "expense_breakdown_chart_data": expense_breakdown_chart_data,
    }
