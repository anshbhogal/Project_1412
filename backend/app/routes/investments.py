from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..dependencies import get_db, get_current_user
from .. import schemas
from ..services import investment_service
from ..schemas import investments as investment_schemas

router = APIRouter(
    prefix="/investments",
    tags=["Investments"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=investment_schemas.InvestmentResponse)
def create_investment(
    investment: investment_schemas.InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    return investment_service.add_investment(db=db, user_id=current_user.id, investment=investment)

@router.get("/", response_model=List[investment_schemas.InvestmentResponse])
def read_investments(
    type: Optional[str] = Query(None, description="Filter by investment type"),
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    investments = investment_service.get_investments(db=db, user_id=current_user.id, type_filter=type)
    return investments

@router.get("/performance", response_model=investment_schemas.InvestmentPerformanceResponse)
def get_investment_performance(
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    performance = investment_service.calculate_performance(db=db, user_id=current_user.id)
    return performance
