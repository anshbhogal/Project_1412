from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.models.models import User, Investment
from app.utils.auth import create_access_token
from datetime import timedelta

client = TestClient(app)

def get_test_token(user_id: int):
    access_token_expires = timedelta(minutes=30)
    return create_access_token(data={"sub": str(user_id)}, expires_delta=access_token_expires)

def test_create_investment(test_db: Session, test_user: User):
    token = get_test_token(test_user.id)
    headers = {"Authorization": f"Bearer {token}"}
    investment_data = {
        "type": "Stock",
        "name": "Google",
        "units": 5.0,
        "buy_price": 1500.0,
        "current_price": 1600.0,
    }
    response = client.post("/investments/", json=investment_data, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "Stock"
    assert data["name"] == "Google"
    assert data["user_id"] == test_user.id
    assert "id" in data

def test_get_investments(test_db: Session, test_user: User):
    token = get_test_token(test_user.id)
    headers = {"Authorization": f"Bearer {token}"}

    # Add a test investment
    investment = Investment(
        user_id=test_user.id,
        type="Bond",
        name="US Treasury",
        units=10.0,
        buy_price=100.0,
        current_price=105.0,
    )
    test_db.add(investment)
    test_db.commit()
    test_db.refresh(investment)

    response = client.get("/investments/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any(inv["name"] == "US Treasury" for inv in data)

    # Test filter by type
    response_filtered = client.get("/investments/?type=Bond", headers=headers)
    assert response_filtered.status_code == 200
    data_filtered = response_filtered.json()
    assert len(data_filtered) == 1
    assert data_filtered[0]["name"] == "US Treasury"

def test_get_investment_performance(test_db: Session, test_user: User):
    token = get_test_token(test_user.id)
    headers = {"Authorization": f"Bearer {token}"}

    # Add multiple investments for performance calculation
    investment1 = Investment(
        user_id=test_user.id,
        type="Stock",
        name="Apple",
        units=2.0,
        buy_price=150.0,
        current_price=160.0,
    )
    investment2 = Investment(
        user_id=test_user.id,
        type="Mutual Fund",
        name="S&P 500 Index",
        units=1.0,
        buy_price=500.0,
        current_price=550.0,
    )
    test_db.add_all([investment1, investment2])
    test_db.commit()

    response = client.get("/investments/performance", headers=headers)
    assert response.status_code == 200
    data = response.json()

    expected_total_invested = (2.0 * 150.0) + (1.0 * 500.0)  # 300 + 500 = 800
    expected_current_value = (2.0 * 160.0) + (1.0 * 550.0)    # 320 + 550 = 870
    expected_pnl = expected_current_value - expected_total_invested  # 870 - 800 = 70

    # Note: Using assert round for float comparison due to potential precision issues
    assert round(data["total_invested"], 2) == round(expected_total_invested, 2)
    assert round(data["current_value"], 2) == round(expected_current_value, 2)
    assert round(data["pnl"], 2) == round(expected_pnl, 2)
    assert "allocations" in data
    assert round(data["allocations"]["Stock"], 2) == round((320/870)*100, 2)
    assert round(data["allocations"]["Mutual Fund"], 2) == round((550/870)*100, 2)
