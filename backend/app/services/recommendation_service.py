
from typing import List
from sqlalchemy.orm import Session
from datetime import datetime
import pandas as pd

from ..models.models import User, Transaction, Investment, TaxDeduction
from . import forecasting_service, investment_service, tax_service
from ..schemas.recommendations import RecommendationResponse


def get_expense_recommendations(user_id: int, db: Session) -> List[str]:
    suggestions = []
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()

    if not transactions:
        suggestions.append("No transaction data available to provide expense recommendations.")
        return suggestions

    expense_transactions = [t for t in transactions if t.amount < 0]
    if not expense_transactions:
        suggestions.append("No expense transactions found. Keep up the good work!")
        return suggestions

    df = pd.DataFrame([t.__dict__ for t in expense_transactions])
    df["month"] = df["date"].dt.to_period("M")
    df["amount"] = df["amount"].abs()

    monthly_avg_expenses = df.groupby("month")["amount"].sum().mean()
    current_month_expenses = df[df["month"] == pd.to_datetime(datetime.now()).to_period("M")]["amount"].sum()

    if current_month_expenses > 1.2 * monthly_avg_expenses and monthly_avg_expenses > 0:
        suggestions.append(
            f"Your expenses this month ({current_month_expenses:.2f}) are significantly higher "
            f"than your average monthly expenses ({monthly_avg_expenses:.2f}). Consider reviewing "
            "your spending to identify areas for cutbacks."
        )

    category_spending = df.groupby("category")["amount"].sum().sort_values(ascending=False)
    if not category_spending.empty:
        most_spent_category = category_spending.index[0]
        most_spent_amount = category_spending.iloc[0]
        suggestions.append(
            f"You spend the most on '{most_spent_category}' (${most_spent_amount:.2f}). "
            "Look for alternatives or set a budget for this category."
        )

    if not suggestions:
        suggestions.append("Your spending looks good! Keep tracking your expenses.")

    return suggestions


def get_tax_recommendations(user_id: int, db: Session) -> List[str]:
    suggestions = []
    tax_deductions = db.query(TaxDeduction).filter(TaxDeduction.user_id == user_id).all()

    total_deductions = sum(d.amount for d in tax_deductions)

    # Rule 1: Suggest Section 80C if total deductions are below a threshold (e.g., 150000 INR)
    # Assuming currency is implicitly handled or not critical for suggestions
    if total_deductions < 150000:
        suggestions.append(
            f"You have utilized ${total_deductions:.2f} in deductions. Consider investing in "
            "Section 80C instruments like PPF, ELSS, and life insurance to save more tax (up to $150,000).")

    # Rule 2: Suggest NPS if not already utilized or below optimal
    # This is a simplified rule; a real system would check for NPS-specific deductions
    nps_deduction_exists = any("NPS" in d.type.upper() for d in tax_deductions)
    if not nps_deduction_exists:
        suggestions.append(
            "Explore National Pension System (NPS) contributions under Section 80CCD(1B) "
            "for an additional deduction of up to $50,000."
        )
    
    if not suggestions:
        suggestions.append("Your tax planning looks good based on your current deductions. Consult a tax advisor for advanced strategies.")

    return suggestions


def get_investment_recommendations(user_id: int, db: Session) -> List[str]:
    suggestions = []
    investments = db.query(Investment).filter(Investment.user_id == user_id).all()

    if not investments:
        suggestions.append("No investment data available. Start investing to grow your wealth!")
        return suggestions

    df = pd.DataFrame([i.__dict__ for i in investments])
    df["current_value_total"] = df["units"] * df["current_price"]

    total_portfolio_value = df["current_value_total"].sum()
    if total_portfolio_value == 0:
        suggestions.append("Your investments currently have no value. Review your portfolio.")
        return suggestions

    # Rule 1: Diversification by type
    type_allocation = df.groupby("type")["current_value_total"].sum() / total_portfolio_value * 100
    if len(type_allocation) < 3:
        suggestions.append(
            f"Your portfolio is concentrated in {len(type_allocation)} asset types. "
            "Consider diversifying across more asset classes like stocks, bonds, and real estate."
        )
    
    # Rule 2: Performance check - very basic for now
    df["pnl"] = (df["current_price"] - df["buy_price"]) * df["units"]
    losing_investments = df[df["pnl"] < 0]

    if not losing_investments.empty:
        suggestions.append(
            f"You have {len(losing_investments)} investments currently at a loss. "
            "Review these positions and consider whether to hold or rebalance."
        )
    
    if not suggestions:
        suggestions.append("Your investment portfolio looks well-balanced and performing adequately.")

    return suggestions


def get_cashflow_alerts(user_id: int, db: Session) -> List[str]:
    suggestions = []
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()

    if not transactions:
        suggestions.append("No transaction data to predict cash flow. Please add some transactions.")
        return suggestions

    # Use the forecasting service to get projected cashflow
    cashflow_forecasts = forecasting_service.get_forecast_cashflow(transactions, 3) # Next 3 months

    for forecast in cashflow_forecasts:
        if forecast.predicted_value < 0:
            suggestions.append(
                f"Alert: Your projected cashflow for {forecast.month} is negative (${forecast.predicted_value:.2f}). "
                "Review your upcoming expenses and income to avoid a shortfall."
            )
    
    if not suggestions:
        suggestions.append("Your projected cashflow looks healthy for the upcoming months.")

    return suggestions
