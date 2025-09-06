# Financial Management Dashboard Backend

## Project Overview
This project provides a robust backend for a personal financial management dashboard, built with FastAPI. It handles user authentication, tracks transactions, manages investments, and provides tax-related insights, forecasting, and personalized recommendations.

## Folder Structure
```
backend/
│── app/
│   │── main.py                # FastAPI entry point
│   │── config.py              # App settings, environment variables
│   │── database.py            # DB connection setup (PostgreSQL preferred)
│   │── models/                # SQLAlchemy models
│   │   │── models.py
│   │── schemas/               # Pydantic schemas
│   │   │── schemas.py
│   │── routes/                # API endpoints (modular by feature)
│   │   │── auth.py
│   │   │── transactions.py
│   │   │── tax.py
│   │   │── investments.py
│   │   │── forecasts.py
│   │   │── recommendations.py
│   │── services/              # Business logic, ML integration
│   │── utils/                 # Helpers (JWT, hashing, etc.)
│   │   │── auth.py
│   │── __init__.py
│
│── tests/                     # Unit & integration tests
│   │── test_auth.py
│   │── test_transactions.py
│── alembic/                   # DB migrations
│   │── versions/
│   │── env.py
│   │── script.py.mako
│   │── README
│── alembic.ini                # Alembic configuration
│── requirements.txt           # Python dependencies
│── Dockerfile                 # For containerization
│── README.md                  # Track progress + documentation
```

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Database Setup
Ensure you have a PostgreSQL database running and update the `DATABASE_URL` in `backend/app/config.py`.

#### Initialize Alembic
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Initialize Alembic (if not already done):
   ```bash
   alembic init alembic
   ```
3. Configure `alembic.ini` (already done by cursor):
   Update `sqlalchemy.url` to match your database connection string.
4. Update `alembic/env.py`:
   Modify `target_metadata` to import `Base` from `app.database`.
5. Generate initial migration:
   ```bash
   alembic revision --autogenerate -m "Initial migration"
   ```
6. Apply migrations:
   ```bash
   alembic upgrade head
   ```

### 3. Run the Backend
```bash
uvicorn app.main:app --reload --port 8000
```
(Make sure to run this command from the `backend` directory or adjust the path)

### 4. Run with Docker
1. Build the Docker image from the `backend` directory:
   ```bash
   docker build -t financial-dashboard-backend .
   ```
2. Run the Docker container:
   ```bash
   docker run -p 8000:8000 financial-dashboard-backend
   ```

## API Endpoints

### Authentication
- `POST /auth/signup`: Register a new user.
- `POST /auth/login`: Authenticate user and return JWT token.
- `GET /auth/me`: Get current authenticated user's information.

### Transactions
- `POST /transactions/upload`: Upload CSV/Excel file of bank transactions.
- `POST /transactions/`: Add a single transaction manually.
- `GET /transactions/`: List user's transactions with filters (date, category, merchant).
- `PUT /transactions/{id}`: Edit an existing transaction.
- `DELETE /transactions/{id}`: Delete a transaction.

### Tax Management
- `GET /tax/summary`: Returns gross income, deductions, taxable income, tax liability.
- `POST /tax/deductions`: Add/update deduction details.
- `GET /tax/suggestions`: Suggest eligible tax-saving options.

### Investments
- `POST /investments`: Add an investment.
- `GET /investments`: Fetch user portfolio (with allocation %).

### Forecasting
- `GET /forecast/expenses`: Predict next month’s expenses.
- `GET /forecast/cashflow`: Cashflow projection.

### Recommendations
- `POST /recommendations/profile`: Save user risk profile.
- `GET /recommendations/portfolio`: Suggest asset allocation + explain.

### Progress Log
- [2025-09-05] Created FastAPI backend structure with main.py, routes/, models/.
- [2025-09-05] Created requirements.txt with initial dependencies.
- [2025-09-05] Created backend/app/config.py for application settings.
- [2025-09-05] Created backend/app/database.py for database connection setup.
- [2025-09-05] Defined SQLAlchemy models in backend/app/models/models.py.
- [2025-09-05] Created Pydantic schemas in backend/app/schemas/schemas.py.
- [2025-09-05] Implemented utility functions for password hashing and JWT in backend/app/utils/auth.py.
- [2025-09-05] Created backend/app/main.py as the FastAPI entry point.
- [2025-09-05] Implemented authentication endpoints in backend/app/routes/auth.py.
- [2025-09-05] Implemented transactions endpoints in backend/app/routes/transactions.py.
- [2025-09-05] Initialized Alembic and configured alembic.ini and env.py.
- [2025-09-05] Created Dockerfile for containerization.
- [2025-09-05] Created unit tests for authentication and transaction endpoints.
