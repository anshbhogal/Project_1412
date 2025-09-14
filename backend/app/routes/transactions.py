import io
from typing import List, Optional
from datetime import datetime

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session

from ..schemas import schemas
from ..schemas.user import User
from ..schemas.schemas import Transaction, TransactionCreate, TransactionUpdate
from ..models.models import Transaction as ModelTransaction
from ..dependencies import get_db, get_current_user

router = APIRouter()

@router.post("/upload", response_model=List[Transaction])
def upload_transactions(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV or Excel files are allowed")

    try:
        contents = file.file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))

        required_columns = ["date", "merchant", "amount", "category"]
        if not all(col in df.columns for col in required_columns):
            missing_cols = [col for col in required_columns if col not in df.columns]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required columns: {', '.join(missing_cols)}. Required columns are: {', '.join(required_columns)}"
            )

        transactions_to_create = []
        all_errors = []

        for index, row in df.iterrows():
            row_errors = []
            
            # Date validation
            try:
                transaction_date = pd.to_datetime(row["date"])
                if pd.isna(transaction_date):
                    row_errors.append(f"Row {index + 2}: Invalid date value.")
            except Exception:
                row_errors.append(f"Row {index + 2}: Invalid date format.")
                transaction_date = None # Set to None to prevent further errors

            # Amount validation
            try:
                amount = float(row["amount"])
            except (ValueError, TypeError):
                row_errors.append(f"Row {index + 2}: Invalid amount value.")
                amount = None

            # Merchant and Category validation
            merchant = str(row["merchant"]).strip() if pd.notna(row["merchant"]) else ""
            category = str(row["category"]).strip() if pd.notna(row["category"]) else ""

            if not merchant:
                row_errors.append(f"Row {index + 2}: Missing merchant.")
            if not category:
                row_errors.append(f"Row {index + 2}: Missing category.")
            
            if row_errors:
                all_errors.extend(row_errors)
                continue

            transaction_data = {
                "date": transaction_date,
                "merchant": merchant,
                "description": str(row.get("description", "")).strip() if pd.notna(row.get("description")) else "",
                "amount": amount,
                "category": category,
                "source": str(row.get("source", "")).strip() if pd.notna(row.get("source")) else "",
            }
            
            try:
                transaction_schema = TransactionCreate(**transaction_data)
                db_transaction = ModelTransaction(**transaction_schema.model_dump(), user_id=current_user.id)
                transactions_to_create.append(db_transaction)
            except Exception as e:
                all_errors.append(f"Row {index + 2}: Schema validation error - {e}")

        if all_errors:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=all_errors)
            
        db.add_all(transactions_to_create)
        db.commit()
        for transaction in transactions_to_create:
            db.refresh(transaction)
        return transactions_to_create

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {e}")

@router.post("/", response_model=Transaction)
def create_transaction(
    transaction: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_transaction = ModelTransaction(**transaction.model_dump(), user_id=current_user.id)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.get("/", response_model=List[Transaction])
def read_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    category: Optional[str] = Query(None),
    merchant: Optional[str] = Query(None),
):
    query = db.query(ModelTransaction).filter(ModelTransaction.user_id == current_user.id)
    if start_date:
        query = query.filter(ModelTransaction.date >= start_date)
    if end_date:
        query = query.filter(ModelTransaction.date <= end_date)
    if category:
        query = query.filter(ModelTransaction.category == category)
    if merchant:
        query = query.filter(ModelTransaction.merchant.ilike(f"%{merchant}%"))
    transactions = query.offset(skip).limit(limit).all()
    return transactions

@router.put("/{transaction_id}", response_model=Transaction)
def update_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_transaction = (
        db.query(ModelTransaction)
        .filter(ModelTransaction.id == transaction_id, ModelTransaction.user_id == current_user.id)
        .first()
    )
    if not db_transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    for key, value in transaction.model_dump(exclude_unset=True).items():
        setattr(db_transaction, key, value)

    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_transaction = (
        db.query(ModelTransaction)
        .filter(ModelTransaction.id == transaction_id, ModelTransaction.user_id == current_user.id)
        .first()
    )
    if not db_transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    db.delete(db_transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}
