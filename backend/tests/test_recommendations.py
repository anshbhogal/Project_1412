
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime

from backend.app.main import app
from backend.app.models.models import User, Transaction, Investment, TaxDeduction
from backend.app.utils.auth import get_password_hash, create_access_token
from backend.app.services import forecasting_service

# We'll reuse the testing setup from test_auth.py
from .test_auth import client, db_session


@pytest.fixture(name="authenticated_client_with_data")
def authenticated_client_with_data_fixture(client: TestClient, db_session: Session):
    # Create a test user
    hashed_password = get_password_hash("testpassword")
    user = User(email="recommendation_test@example.com", password_hash=hashed_password)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Add sample transactions
    transactions_data = [
        {"date": datetime(2023, 1, 15), "merchant": "Groceries", "amount": -100.00, "category": "Food", "source": "Card", "user_id": user.id},
        {"date": datetime(2023, 1, 20), "merchant": "Salary", "amount": 2000.00, "category": "Income", "source": "Bank", "user_id": user.id},
        {"date": datetime(2023, 2, 10), "merchant": "Rent", "amount": -800.00, "category": "Housing", "source": "Bank", "user_id": user.id},
        {"date": datetime(2023, 2, 25), "merchant": "Freelance", "amount": 500.00, "category": "Income", "source": "Bank", "user_id": user.id},
        {"date": datetime(2023, 3, 5), "merchant": "Utilities", "amount": -150.00, "category": "Bills", "source": "Card", "user_id": user.id},
        {"date": datetime(2023, 3, 10), "merchant": "Investment", "amount": -200.00, "category": "Investment", "source": "Bank", "user_id": user.id},
        {"date": datetime(2023, 3, 22), "merchant": "Refund", "amount": 50.00, "category": "Income", "source": "Card", "user_id": user.id},
        {"date": datetime(2023, 4, 1), "merchant": "Groceries", "amount": -120.00, "category": "Food", "source": "Card", "user_id": user.id},
        {"date": datetime(2023, 4, 15), "merchant": "Salary", "amount": 2100.00, "category": "Income", "source": "Bank", "user_id": user.id},
        {"date": datetime(2023, 4, 20), "merchant": "Entertainment", "amount": -70.00, "category": "Leisure", "source": "Card", "user_id": user.id},
    ]
    for data in transactions_data:
        db_session.add(Transaction(**data))
    db_session.commit()

    # Add sample investments
    investments_data = [
        {"type": "Stock", "name": "Infosys", "units": 10, "buy_price": 1400, "current_price": 1550, "user_id": user.id},
        {"type": "Mutual Fund", "name": "Growth Fund", "units": 50, "buy_price": 500, "current_price": 520, "user_id": user.id},
        {"type": "Stock", "name": "Tata Motors", "units": 20, "buy_price": 800, "current_price": 750, "user_id": user.id},
    ]
    for data in investments_data:
        db_session.add(Investment(**data))
    db_session.commit()

    # Add sample tax deductions
    tax_deductions_data = [
        {"type": "80C PPF", "amount": 80000, "user_id": user.id},
        {"type": "80CCD(1B) NPS", "amount": 30000, "user_id": user.id},
    ]
    for data in tax_deductions_data:
        db_session.add(TaxDeduction(**data))
    db_session.commit()

    access_token = create_access_token(data={"sub": user.email})
    client.headers = {"Authorization": f"Bearer {access_token}"}
    return client


@pytest.fixture(name="authenticated_client_no_data")
def authenticated_client_no_data_fixture(client: TestClient, db_session: Session):
    hashed_password = get_password_hash("no_data_password")
    user = User(email="no_data_reco@example.com", password_hash=hashed_password)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    access_token = create_access_token(data={"sub": user.email})
    client.headers = {"Authorization": f"Bearer {access_token}"}
    return client


def test_get_expense_recommendations(authenticated_client_with_data: TestClient):
    response = authenticated_client_with_data.get("/recommendations/expenses")
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "expenses"
    assert isinstance(data["suggestions"], list)
    assert len(data["suggestions"]) > 0

def test_get_expense_recommendations_no_data(authenticated_client_no_data: TestClient):
    response = authenticated_client_no_data.get("/recommendations/expenses")
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "expenses"
    assert "No transaction data available" in data["suggestions"][0]

def test_get_tax_recommendations(authenticated_client_with_data: TestClient):
    response = authenticated_client_with_data.get("/recommendations/tax")
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "tax"
    assert isinstance(data["suggestions"], list)
    assert len(data["suggestions"]) > 0

def test_get_tax_recommendations_no_data(authenticated_client_no_data: TestClient):
    response = authenticated_client_no_data.get("/recommendations/tax")
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "tax"
    assert "Your tax planning looks good" in data["suggestions"][0] or "You have utilized" in data["suggestions"][0]

def test_get_investment_recommendations(authenticated_client_with_data: TestClient):
    response = authenticated_client_with_data.get("/recommendations/investments")
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "investments"
    assert isinstance(data["suggestions"], list)
    assert len(data["suggestions"]) > 0

def test_get_investment_recommendations_no_data(authenticated_client_no_data: TestClient):
    response = authenticated_client_no_data.get("/recommendations/investments")
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "investments"
    assert "No investment data available" in data["suggestions"][0]

def test_get_cashflow_alerts(authenticated_client_with_data: TestClient):
    response = authenticated_client_with_data.get("/recommendations/cashflow")
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "cashflow"
    assert isinstance(data["suggestions"], list)
    assert len(data["suggestions"]) > 0

def test_get_cashflow_alerts_no_data(authenticated_client_no_data: TestClient):
    response = authenticated_client_no_data.get("/recommendations/cashflow")
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "cashflow"
    assert "No transaction data to predict cash flow" in data["suggestions"][0]

def test_unauthenticated_access_recommendations(client: TestClient):
    endpoints = ["expenses", "tax", "investments", "cashflow"]
    for endpoint in endpoints:
        response = client.get(f"/recommendations/{endpoint}")
        assert response.status_code == 401
        assert response.json() == {"detail": "Not authenticated"}
