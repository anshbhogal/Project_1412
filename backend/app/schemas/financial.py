from pydantic import BaseModel

class FinancialSummary(BaseModel):
    total_income: float
    total_expenses: float
    net_savings: float
    investment_value: float
    tax_liability: float
    income_vs_expenses_chart_data: list
    expense_breakdown_chart_data: list
