
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.schemas.forecasting import ForecastRequest, ForecastResponseList
from backend.app.services import forecasting_service
from backend.app.dependencies import get_db
from backend.app.routes.auth import get_current_user
from backend.app.models.transaction import Transaction
from backend.app.schemas.schemas import User

router = APIRouter(prefix="/forecasting", tags=["Forecasting"])


@router.get("/expenses", response_model=ForecastResponseList)
def get_predicted_expenses(
    request: ForecastRequest = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transactions = (
        db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    )
    forecasts = forecasting_service.get_forecast_expenses(
        transactions, request.months
    )
    return ForecastResponseList(forecasts=forecasts)


@router.get("/income", response_model=ForecastResponseList)
def get_predicted_income(
    request: ForecastRequest = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transactions = (
        db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    )
    forecasts = forecasting_service.get_forecast_income(transactions, request.months)
    return ForecastResponseList(forecasts=forecasts)


@router.get("/cashflow", response_model=ForecastResponseList)
def get_projected_cashflow(
    request: ForecastRequest = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transactions = (
        db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    )
    forecasts = forecasting_service.get_forecast_cashflow(transactions, request.months)
    return ForecastResponseList(forecasts=forecasts)
