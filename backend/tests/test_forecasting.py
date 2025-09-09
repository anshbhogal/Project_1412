
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime

from backend.app.main import app
from backend.app.models.models import User, Transaction
from backend.app.utils.auth import get_password_hash, create_access_token

# We'll reuse the testing setup from test_auth.py
from .test_auth import client, db_session


# Helper to get an authenticated client and add some transactions
@pytest.fixture(name="authenticated_client_with_transactions")
def authenticated_client_with_transactions_fixture(client: TestClient, db_session: Session):
    # Create a test user
    hashed_password = get_password_hash("testpassword")
    user = User(email="forecast_test@example.com", password_hash=hashed_password)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Add some sample transactions for forecasting
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
        db_transaction = Transaction(**data)
        db_session.add(db_transaction)
    db_session.commit()

    # Get an access token for the test user
    access_token = create_access_token(data={"sub": user.email})

    # Return a client with the authorization header
    client.headers = {"Authorization": f"Bearer {access_token}"}
    return client


@pytest.fixture(name="authenticated_client_no_transactions")
def authenticated_client_no_transactions_fixture(client: TestClient, db_session: Session):
    # Create a test user with no transactions
    hashed_password = get_password_hash("no_trans_password")
    user = User(email="no_trans_forecast@example.com", password_hash=hashed_password)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    access_token = create_access_token(data={"sub": user.email})
    client.headers = {"Authorization": f"Bearer {access_token}"}
    return client


def test_get_predicted_expenses(authenticated_client_with_transactions: TestClient):
    response = authenticated_client_with_transactions.get("/forecasting/expenses")
    assert response.status_code == 200
    data = response.json()
    assert "forecasts" in data
    assert len(data["forecasts"]) == 6  # Default 6 months
    for forecast in data["forecasts"]:
        assert "month" in forecast
        assert "predicted_value" in forecast
        assert isinstance(forecast["predicted_value"], (float, int))
        assert forecast["predicted_value"] >= 0  # Expenses should be positive values after abs()


def test_get_predicted_expenses_custom_months(authenticated_client_with_transactions: TestClient):
    response = authenticated_client_with_transactions.get("/forecasting/expenses?months=3")
    assert response.status_code == 200
    data = response.json()
    assert "forecasts" in data
    assert len(data["forecasts"]) == 3


def test_get_predicted_expenses_no_transactions(authenticated_client_no_transactions: TestClient):
    response = authenticated_client_no_transactions.get("/forecasting/expenses")
    assert response.status_code == 200
    data = response.json()
    assert "forecasts" in data
    assert len(data["forecasts"]) == 0  # Should return empty list if no transactions


def test_get_predicted_income(authenticated_client_with_transactions: TestClient):
    response = authenticated_client_with_transactions.get("/forecasting/income")
    assert response.status_code == 200
    data = response.json()
    assert "forecasts" in data
    assert len(data["forecasts"]) == 6
    for forecast in data["forecasts"]:
        assert "month" in forecast
        assert "predicted_value" in forecast
        assert isinstance(forecast["predicted_value"], (float, int))
        assert forecast["predicted_value"] >= 0


def test_get_predicted_income_no_transactions(authenticated_client_no_transactions: TestClient):
    response = authenticated_client_no_transactions.get("/forecasting/income")
    assert response.status_code == 200
    data = response.json()
    assert "forecasts" in data
    assert len(data["forecasts"]) == 0


def test_get_projected_cashflow(authenticated_client_with_transactions: TestClient):
    response = authenticated_client_with_transactions.get("/forecasting/cashflow")
    assert response.status_code == 200
    data = response.json()
    assert "forecasts" in data
    assert len(data["forecasts"]) == 6
    for forecast in data["forecasts"]:
        assert "month" in forecast
        assert "predicted_value" in forecast
        assert isinstance(forecast["predicted_value"], (float, int))


def test_get_projected_cashflow_no_transactions(authenticated_client_no_transactions: TestClient):
    response = authenticated_client_no_transactions.get("/forecasting/cashflow")
    assert response.status_code == 200
    data = response.json()
    assert "forecasts" in data
    assert len(data["forecasts"]) == 0


def test_unauthenticated_access_forecasting_expenses(client: TestClient):
    response = client.get("/forecasting/expenses")
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


def test_unauthenticated_access_forecasting_income(client: TestClient):
    response = client.get("/forecasting/income")
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


def test_unauthenticated_access_forecasting_cashflow(client: TestClient):
    response = client.get("/forecasting/cashflow")
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}
