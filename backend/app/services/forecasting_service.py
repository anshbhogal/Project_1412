
import pandas as pd
from datetime import date
from typing import List

from ..models.models import Transaction
from ..schemas.forecasting import ForecastResponse
from prophet import Prophet
from sqlalchemy.orm import Session
from backend.app.schemas.forecasting import ForecastResult


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


def generate_financial_forecast(db: Session, user_id: int, months: int = 6) -> List[ForecastResult]:
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).order_by(Transaction.date).all()

    if not transactions:
        return []

    data = [{
        "date": t.date,
        "amount": t.amount,
        "type": t.transaction_type.value
    } for t in transactions]
    df = pd.DataFrame(data)

    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").resample("D").sum(numeric_only=True).reset_index()
    df.fillna(0, inplace=True)

    income_df = df[df["type"] == "income"].rename(columns={"date": "ds", "amount": "y"})
    expenses_df = df[df["type"] == "expense"].rename(columns={"date": "ds", "amount": "y"})

    # Handle cases where income_df or expenses_df might be empty after filtering
    if income_df.empty:
        income_df = pd.DataFrame(columns=["ds", "y"])
    if expenses_df.empty:
        expenses_df = pd.DataFrame(columns=["ds", "y"])

    # Prophet model for Income
    income_predictions = pd.DataFrame()
    if not income_df.empty and len(income_df) > 1:
        income_model = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)
        income_model.fit(income_df)
        future_income = income_model.make_future_dataframe(periods=months, freq='M')
        forecast_income = income_model.predict(future_income)
        income_predictions = forecast_income[['ds', 'yhat']].set_index('ds')

    # Prophet model for Expenses
    expenses_predictions = pd.DataFrame()
    if not expenses_df.empty and len(expenses_df) > 1:
        expenses_model = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)
        expenses_model.fit(expenses_df)
        future_expenses = expenses_model.make_future_dataframe(periods=months, freq='M')
        forecast_expenses = expenses_model.predict(future_expenses)
        expenses_predictions = forecast_expenses[['ds', 'yhat']].set_index('ds')

    # Combine predictions
    all_dates = pd.date_range(start=df['date'].min(), periods=len(df) + months, freq='MS')
    
    combined_predictions = []
    for i in range(months):
        current_month = pd.Timestamp.now().to_period('M').start_time + pd.DateOffset(months=i)
        month_str = current_month.strftime("%Y-%m")

        income_val = income_predictions.loc[income_predictions.index.to_period('M') == current_month.to_period('M'), 'yhat'].sum() if not income_predictions.empty else 0
        expenses_val = expenses_predictions.loc[expenses_predictions.index.to_period('M') == current_month.to_period('M'), 'yhat'].sum() if not expenses_predictions.empty else 0

        combined_predictions.append(ForecastResult(
            month=month_str,
            income=max(0, round(income_val)),  # Ensure no negative predictions
            expenses=max(0, round(expenses_val)) # Ensure no negative predictions
        ))

    return combined_predictions
