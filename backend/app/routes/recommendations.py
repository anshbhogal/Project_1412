
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.app.schemas.recommendations import RecommendationResponse
from backend.app.services import recommendation_service
from backend.app.dependencies import get_db
from backend.app.routes.auth import get_current_user
from backend.app.schemas.schemas import User

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("/expenses", response_model=RecommendationResponse)
def get_expense_recommendations_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    suggestions = recommendation_service.get_expense_recommendations(current_user.id, db)
    return RecommendationResponse(category="expenses", suggestions=suggestions)


@router.get("/tax", response_model=RecommendationResponse)
def get_tax_recommendations_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    suggestions = recommendation_service.get_tax_recommendations(current_user.id, db)
    return RecommendationResponse(category="tax", suggestions=suggestions)


@router.get("/investments", response_model=RecommendationResponse)
def get_investment_recommendations_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    suggestions = recommendation_service.get_investment_recommendations(current_user.id, db)
    return RecommendationResponse(category="investments", suggestions=suggestions)


@router.get("/cashflow", response_model=RecommendationResponse)
def get_cashflow_alerts_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    suggestions = recommendation_service.get_cashflow_alerts(current_user.id, db)
    return RecommendationResponse(category="cashflow", suggestions=suggestions)
