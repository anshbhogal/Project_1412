from sqlalchemy.orm import Session
from typing import List, Optional

from ..models import models
from ..schemas import investments as investment_schemas

def add_investment(db: Session, user_id: int, investment: investment_schemas.InvestmentCreate):
    db_investment = models.Investment(**investment.model_dump(), user_id=user_id)
    db.add(db_investment)
    db.commit()
    db.refresh(db_investment)
    return db_investment

def get_investments(db: Session, user_id: int, type_filter: Optional[str] = None):
    query = db.query(models.Investment).filter(models.Investment.user_id == user_id)
    if type_filter:
        query = query.filter(models.Investment.type == type_filter)
    return query.all()

def calculate_performance(db: Session, user_id: int):
    investments = get_investments(db, user_id)

    total_invested = sum(inv.units * inv.buy_price for inv in investments)
    current_value = sum(inv.units * inv.current_price for inv in investments)
    pnl = current_value - total_invested

    allocations = {}
    for inv in investments:
        if inv.type not in allocations:
            allocations[inv.type] = 0
        allocations[inv.type] += inv.units * inv.current_price
    
    total_current_value = sum(allocations.values())
    for type, value in allocations.items():
        allocations[type] = (value / total_current_value) * 100 if total_current_value else 0
    
    return {
        "total_invested": total_invested,
        "current_value": current_value,
        "pnl": pnl,
        "allocations": allocations
    }
