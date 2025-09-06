import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime

from app.main import app
from app.database import Base
from app.config import settings
from app.models.models import User, Transaction
from app.utils.auth import get_password_hash, create_access_token
from app.routes.auth import get_db as get_db_auth

# We'll reuse the testing setup from test_auth.py
from .test_auth import client, db_session

# Helper to get an authenticated client
@pytest.fixture(name="authenticated_client")
def authenticated_client_fixture(client: TestClient, db_session: Session):
    # Create a test user
    hashed_password = get_password_hash("testpassword")
    user = User(email="transaction_test@example.com", password_hash=hashed_password)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Get an access token for the test user
    access_token = create_access_token(data={"sub": user.email})
    
    # Return a client with the authorization header
    client.headers = {"Authorization": f"Bearer {access_token}"}
    return client

def test_create_transaction(authenticated_client: TestClient, db_session: Session):
    response = authenticated_client.post(
        "/transactions/",
        json={
            "date": "2025-01-01T12:00:00Z",
            "merchant": "Test Store",
            "description": "Test purchase",
            "amount": 50.00,
            "category": "Shopping",
            "source": "Credit Card"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["merchant"] == "Test Store"
    assert data["user_id"] == 1  # Assuming first user created in test_auth
    assert db_session.query(Transaction).filter(Transaction.id == data["id"]).first() is not None

def test_read_transactions(authenticated_client: TestClient, db_session: Session):
    # Create a transaction first
    user = db_session.query(User).filter(User.email == "transaction_test@example.com").first()
    db_transaction = Transaction(
        user_id=user.id,
        date=datetime.utcnow(),
        merchant="Read Test",
        amount=25.00,
        category="Food"
    )
    db_session.add(db_transaction)
    db_session.commit()
    db_session.refresh(db_transaction)

    response = authenticated_client.get("/transactions/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any(t["merchant"] == "Read Test" for t in data)

def test_update_transaction(authenticated_client: TestClient, db_session: Session):
    user = db_session.query(User).filter(User.email == "transaction_test@example.com").first()
    db_transaction = Transaction(
        user_id=user.id,
        date=datetime.utcnow(),
        merchant="Update Test",
        amount=100.00,
        category="Utilities"
    )
    db_session.add(db_transaction)
    db_session.commit()
    db_session.refresh(db_transaction)

    response = authenticated_client.put(
        f"/transactions/{db_transaction.id}",
        json={"amount": 120.00, "category": "Bills"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 120.00
    assert data["category"] == "Bills"
    db_session.refresh(db_transaction)
    assert db_transaction.amount == 120.00

def test_delete_transaction(authenticated_client: TestClient, db_session: Session):
    user = db_session.query(User).filter(User.email == "transaction_test@example.com").first()
    db_transaction = Transaction(
        user_id=user.id,
        date=datetime.utcnow(),
        merchant="Delete Test",
        amount=75.00,
        category="Transport"
    )
    db_session.add(db_transaction)
    db_session.commit()
    db_session.refresh(db_transaction)

    response = authenticated_client.delete(f"/transactions/{db_transaction.id}")
    assert response.status_code == 204
    assert db_session.query(Transaction).filter(Transaction.id == db_transaction.id).first() is None
