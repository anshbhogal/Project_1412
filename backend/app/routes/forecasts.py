from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from ..dependencies import get_db, get_current_user
from .. import models
from ..schemas.forecasting import ForecastRequest, ForecastResponseList
from ..services import forecasting_service
from ..schemas.user import UserResponse

router = APIRouter(prefix="/forecasting", tags=["Forecasting"])

@router.get("/expenses", response_model=ForecastResponseList)
def get_predicted_expenses(
    request: ForecastRequest = Depends(),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    transactions = (
        db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).all()
    )
    forecasts = forecasting_service.get_forecast_expenses(
        transactions, request.months
    )
    return ForecastResponseList(forecasts=forecasts)

@router.get("/income", response_model=ForecastResponseList)
def get_predicted_income(
    request: ForecastRequest = Depends(),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    transactions = (
        db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).all()
    )
    forecasts = forecasting_service.get_forecast_income(transactions, request.months)
    return ForecastResponseList(forecasts=forecasts)

@router.get("/cashflow", response_model=ForecastResponseList)
def get_projected_cashflow(
    request: ForecastRequest = Depends(),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    transactions = (
        db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).all()
    )
    forecasts = forecasting_service.get_forecast_cashflow(transactions, request.months)
    return ForecastResponseList(forecasts=forecasts)
