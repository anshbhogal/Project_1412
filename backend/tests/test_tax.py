from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from ..app.main import app
from ..app.database import Base, get_db
from ..app.models.models import User, Transaction, TaxDeduction
from ..app.utils.auth import create_access_token, get_password_hash

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}, 
    poolclass=StaticPool
)
SessionTesting = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

@app.on_event("shutdown")
def shutdown_event():
    Base.metadata.drop_all(bind=engine)

def override_get_db():
    try:
        db = SessionTesting()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def authenticate_user(email: str = "test@example.com", password: str = "testpassword"):    
    # Hash the password for the test user
    hashed_password = get_password_hash(password)
    
    # Create a user directly in the test database
    db = SessionTesting()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, password_hash=hashed_password)
        db.add(user)
        db.commit()
        db.refresh(user)
    db.close()
    
    # Create a token for the test user
    access_token = create_access_token(data={"sub": email})
    return {"Authorization": f"Bearer {access_token}"}

def test_get_tax_summary():
    headers = authenticate_user()
    db = SessionTesting()
    user = db.query(User).filter(User.email == "test@example.com").first()

    # Clean up any existing transactions/deductions for the user
    db.query(Transaction).filter(Transaction.user_id == user.id).delete()
    db.query(TaxDeduction).filter(TaxDeduction.user_id == user.id).delete()
    db.commit()

    # Add mock income transactions
    income1 = Transaction(user_id=user.id, date="2023-01-01T00:00:00", merchant="Company A", description="Salary", amount=500000.0, category="income")
    income2 = Transaction(user_id=user.id, date="2023-02-01T00:00:00", merchant="Freelance", description="Project", amount=150000.0, category="income")
    
    # Add mock expense transaction (not considered for tax summary income/deductions directly in this simple model)
    expense = Transaction(user_id=user.id, date="2023-03-01T00:00:00", merchant="Rent", description="Monthly Rent", amount=20000.0, category="expense")

    db.add_all([income1, income2, expense])
    db.commit()

    # Add mock 80C deductions
    deduction1 = TaxDeduction(user_id=user.id, type="PPF", amount=80000.0)
    deduction2 = TaxDeduction(user_id=user.id, type="ELSS", amount=70000.0)
    deduction3 = TaxDeduction(user_id=user.id, type="Insurance", amount=20000.0) # This will be capped

    db.add_all([deduction1, deduction2, deduction3])
    db.commit()
    db.close()

    response = client.get("/tax/summary", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["gross_income"] == 650000.0  # 500000 + 150000
    # Standard Deduction (50000) + Capped 80C (150000, since 80+70+20 = 170 > 150) = 200000
    assert data["deductions"] == 200000.0 
    assert data["taxable_income"] == 450000.0 # 650000 - 200000
    # Tax: (2.5L-5L @ 5%) = (450000-250000) * 0.05 = 200000 * 0.05 = 10000.0
    assert data["tax_liability"] == 10000.0

def test_create_tax_deduction():
    headers = authenticate_user(email="deduction@example.com")
    db = SessionTesting()
    user = db.query(User).filter(User.email == "deduction@example.com").first()
    db.query(TaxDeduction).filter(TaxDeduction.user_id == user.id).delete()
    db.commit()
    db.close()

    response = client.post(
        "/tax/deductions",
        headers=headers,
        json={
            "type": "NPS",
            "amount": 40000.0
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "NPS"
    assert data["amount"] == 40000.0
    assert "id" in data

    db = SessionTesting()
    deduction = db.query(TaxDeduction).filter(TaxDeduction.id == data["id"]).first()
    assert deduction.user_id == user.id
    db.close()

def test_get_tax_suggestions():
    headers = authenticate_user(email="suggestions@example.com")
    db = SessionTesting()
    user = db.query(User).filter(User.email == "suggestions@example.com").first()
    
    # Clear previous transactions and deductions
    db.query(Transaction).filter(Transaction.user_id == user.id).delete()
    db.query(TaxDeduction).filter(TaxDeduction.user_id == user.id).delete()
    db.commit()

    # Add some income but keep 80C deductions low to trigger suggestion
    income = Transaction(user_id=user.id, date="2023-01-01T00:00:00", merchant="Company B", description="Salary", amount=400000.0, category="income")
    db.add(income)
    db.commit()
    db.close()

    response = client.get("/tax/suggestions", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "suggestions" in data
    assert len(data["suggestions"]) > 0
    assert any("Section 80C" in s for s in data["suggestions"])
    assert any("Section 80CCD(1B)" in s for s in data["suggestions"])
