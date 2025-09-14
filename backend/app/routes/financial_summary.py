from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..schemas.user import User
from ..schemas.financial import FinancialSummary
from ..services import financial_service

router = APIRouter()

@router.get("/financial", response_model=FinancialSummary)
def get_summary_financial(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    start_date: datetime = Query(...), # Made mandatory
    end_date: datetime = Query(...),   # Made mandatory
):
    summary = financial_service.get_financial_summary(
        db=db,
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date
    )
    return FinancialSummary(**summary)
