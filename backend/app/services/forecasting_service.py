
import pandas as pd
from datetime import date
from typing import List

from ..models.models import Transaction
from ...schemas.forecasting import ForecastResponse


def get_monthly_transactions(transactions: List[Transaction], is_expense: bool):
    # Filter transactions based on type (expense or income)
    filtered_transactions = [
        t for t in transactions if (t.amount < 0 if is_expense else t.amount > 0)
    ]

    # Group by month and sum amounts
    monthly_data = {}
    for t in filtered_transactions:
        month_year = t.date.strftime("%Y-%m")
        if month_year not in monthly_data:
            monthly_data[month_year] = 0.0
        monthly_data[month_year] += abs(t.amount)  # Use absolute value for expenses/income

    # Convert to Pandas Series for easy manipulation
    series = (
        pd.Series(monthly_data).sort_index()
        if monthly_data
        else pd.Series(dtype=float)
    )
    return series


def forecast_data(series: pd.Series, months_to_forecast: int) -> List[ForecastResponse]:
    if series.empty:
        return []

    # Simple forecasting: Use the average of the last 3 months as the prediction
    # If less than 3 months of data, use available data's average
    if len(series) < 3:
        avg_value = series.mean()
    else:
        avg_value = series.tail(3).mean()

    last_month = pd.to_datetime(series.index[-1])
    predictions = []

    for i in range(1, months_to_forecast + 1):
        next_month = last_month + pd.DateOffset(months=i)
        predictions.append(
            ForecastResponse(
                month=next_month.strftime("%Y-%m"), predicted_value=round(avg_value, 2)
            )
        )
    return predictions


def get_forecast_expenses(transactions: List[Transaction], months: int):
    expense_series = get_monthly_transactions(transactions, is_expense=True)
    return forecast_data(expense_series, months)


def get_forecast_income(transactions: List[Transaction], months: int):
    income_series = get_monthly_transactions(transactions, is_expense=False)
    return forecast_data(income_series, months)


def get_forecast_cashflow(transactions: List[Transaction], months: int):
    expense_series = get_monthly_transactions(transactions, is_expense=True)
    income_series = get_monthly_transactions(transactions, is_expense=False)

    # Align indices and fill missing values with 0
    all_months = expense_series.index.union(income_series.index).sort_values()
    aligned_expenses = expense_series.reindex(all_months, fill_value=0)
    aligned_income = income_series.reindex(all_months, fill_value=0)

    net_cashflow_series = aligned_income - aligned_expenses
    return forecast_data(net_cashflow_series, months)
