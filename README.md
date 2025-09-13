### Tax Management Module

The Tax Management module provides endpoints to calculate tax summaries, manage tax deductions, and receive tax-saving suggestions.

#### Endpoints

##### `GET /tax/summary`

Calculates the tax summary for the logged-in user based on income and deductions.

**Example Response:**

```json
{
  "gross_income": 650000,
  "deductions": 200000,
  "taxable_income": 450000,
  "tax_liability": 10000
}
```

##### `POST /tax/deductions`

Allows users to add new tax deductions.

**Example Request:**

```json
{
  "type": "PPF",
  "amount": 50000
}
```

**Example Response:**

```json
{
  "id": 1,
  "user_id": 123,
  "type": "PPF",
  "amount": 50000,
  "created_at": "2023-10-27T10:00:00.000Z"
}
```

##### `GET /tax/suggestions`

Provides rule-based tax-saving suggestions for the user.

**Example Response:**

```json
{
  "suggestions": [
    "Invest up to ₹1.5L in Section 80C instruments (PPF, ELSS, Insurance).",
    "Consider NPS contributions under Section 80CCD(1B) for an extra ₹50,000 deduction."
  ]
}
```

### Investments Module

The Investments module allows users to track their investments, view portfolio performance, and get allocation insights.

#### Endpoints

##### `POST /investments`

Add a new investment for the logged-in user.

**Example Request:**

```json
{
  "type": "Stock",
  "name": "Infosys",
  "units": 10,
  "buy_price": 1400,
  "current_price": 1550
}
```

**Example Response:**

```json
{
  "id": 1,
  "type": "Stock",
  "name": "Infosys",
  "units": 10,
  "buy_price": 1400,
  "current_price": 1550,
  "user_id": 123,
  "created_at": "2023-10-27T10:00:00.000Z"
}
```

##### `GET /investments`

Fetch all investments for the logged-in user. Supports optional filter by type.

**Example Response:**

```json
[
  {
    "id": 1,
    "type": "Stock",
    "name": "Infosys",
    "units": 10,
    "buy_price": 1400,
    "current_price": 1550,
    "user_id": 123,
    "created_at": "2023-10-27T10:00:00.000Z"
  }
]
```

##### `GET /investments/performance`

Returns portfolio performance analysis.

**Example Response:**

```json
{
  "total_invested": 250000,
  "current_value": 275000,
  "pnl": 25000,
  "allocations": {
    "Stock": 60,
    "Mutual Fund": 30,
    "Gold": 10
  }
}
```

## Forecasting Module

The Forecasting module predicts future expenses, incomes, and cashflow trends using historical transaction data.

#### Endpoints

##### `GET /forecasting/expenses`

Returns predicted monthly expenses for the next 3-6 months. Requires JWT authentication.

**Example Request:**

```
GET /forecasting/expenses?months=3
Authorization: Bearer <your_jwt_token>
```

**Example Response:**

```json
{
  "forecasts": [
    { "month": "2023-05", "predicted_value": 150.75 },
    { "month": "2023-06", "predicted_value": 150.75 },
    { "month": "2023-07", "predicted_value": 150.75 }
  ]
}
```

##### `GET /forecasting/income`

Returns predicted monthly income for the next 3-6 months. Requires JWT authentication.

**Example Request:**

```
GET /forecasting/income?months=6
Authorization: Bearer <your_jwt_token>
```

**Example Response:**

```json
{
  "forecasts": [
    { "month": "2023-05", "predicted_value": 1533.33 },
    { "month": "2023-06", "predicted_value": 1533.33 },
    { "month": "2023-07", "predicted_value": 1533.33 },
    { "month": "2023-08", "predicted_value": 1533.33 },
    { "month": "2023-09", "predicted_value": 1533.33 },
    { "month": "2023-10", "predicted_value": 1533.33 }
  ]
}
```

##### `GET /forecasting/cashflow`

Returns projected net cashflow (income - expenses) for the next 3-6 months. Requires JWT authentication.

**Example Request:**

```
GET /forecasting/cashflow
Authorization: Bearer <your_jwt_token>
```

**Example Response:**

```json
{
  "forecasts": [
    { "month": "2023-05", "predicted_value": 1382.58 },
    { "month": "2023-06", "predicted_value": 1382.58 },
    { "month": "2023-07", "predicted_value": 1382.58 },
    { "month": "2023-08", "predicted_value": 1382.58 },
    { "month": "2023-09", "predicted_value": 1382.58 },
    { "month": "2023-10", "predicted_value": 1382.58 }
  ]
}
```

## Recommendations Module

The Recommendations module generates personalized insights and suggestions based on user financial data (transactions, taxes, investments, and forecasts). Recommendations are currently rule-based, with an architecture designed for future integration of ML models.

#### Endpoints

##### `GET /recommendations/expenses`

Suggests ways to cut down overspending based on transaction history. Requires JWT authentication.

**Example Request:**

```
GET /recommendations/expenses
Authorization: Bearer <your_jwt_token>
```

**Example Response:**

```json
{
  "category": "expenses",
  "suggestions": [
    "Your expenses this month ($XXX.XX) are significantly higher than your average monthly expenses ($YYY.YY). Consider reviewing your spending to identify areas for cutbacks.",
    "You spend the most on 'Food' ($ZZZ.ZZ). Look for alternatives or set a budget for this category."
  ]
}
```

##### `GET /recommendations/tax`

Provides tax-saving suggestions based on configured deduction rules and user's current deductions. Requires JWT authentication.

**Example Request:**

```
GET /recommendations/tax
Authorization: Bearer <your_jwt_token>
```

**Example Response:**

```json
{
  "category": "tax",
  "suggestions": [
    "You have utilized $XXX.XX in deductions. Consider investing in Section 80C instruments like PPF, ELSS, and life insurance to save more tax (up to $150,000).",
    "Explore National Pension System (NPS) contributions under Section 80CCD(1B) for an additional deduction of up to $50,000."
  ]
}
```

##### `GET /recommendations/investments`

Recommends portfolio improvements such as diversification or rebalancing based on investment data. Requires JWT authentication.

**Example Request:**

```
GET /recommendations/investments
Authorization: Bearer <your_jwt_token>
```

**Example Response:**

```json
{
  "category": "investments",
  "suggestions": [
    "Your portfolio is concentrated in X asset types. Consider diversifying across more asset classes like stocks, bonds, and real estate.",
    "You have Y investments currently at a loss. Review these positions and consider whether to hold or rebalance."
  ]
}
```

##### `GET /recommendations/cashflow`

Alerts the user about potential negative cashflow based on forecasting data. Requires JWT authentication.

**Example Request:**

```
GET /recommendations/cashflow
Authorization: Bearer <your_jwt_token>
```

**Example Response:**

```json
{
  "category": "cashflow",
  "suggestions": [
    "Alert: Your projected cashflow for YYYY-MM is negative ($-XXX.XX). Review your upcoming expenses and income to avoid a shortfall."
  ]
}
```

### Frontend–Backend Integration Layer

The frontend communicates with the FastAPI backend using a centralized Axios instance configured in `frontend/src/api/index.js`.
JWT authentication tokens are automatically attached to outgoing requests from `localStorage`.
Unauthorized (401) responses are handled by clearing the local token and (in a production setup) redirecting to the login page.

**API Service Files:**
*   `frontend/src/api/auth.js`: Handles user signup, login, fetching current user details, and logout.
*   `frontend/src/api/transactions.js`: Provides CRUD operations for transactions and transaction file uploads.
*   `frontend/src/api/tax.js`: Includes functions for fetching tax summaries, adding deductions, and retrieving tax-saving suggestions.
*   `frontend/src/api/investments.js`: Manages adding investments, listing all investments, and fetching portfolio performance.
*   `frontend/src/api/forecasting.js`: Offers endpoints for retrieving expense, income, and cashflow predictions.
*   `frontend/src/api/recommendations.js`: Fetches personalized suggestions for expenses, tax, investments, and cashflow.

**Example Usage (e.g., in a React component):**

```javascript
import { getTransactions } from '../api/transactions';

// ... inside an async function or useEffect
const fetchTransactions = async () => {
  try {
    const data = await getTransactions();
    console.log('Transactions:', data);
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
  }
};
```

## Setup & Troubleshooting

### Backend Setup

*   Install Python 3.12+
*   Create and activate a virtual environment (venv):

    ```bash
    python -m venv venv
    venv\Scripts\activate   # on Windows
    source venv/bin/activate # on Mac/Linux
    ```
*   Install dependencies with `pip install -r requirements.txt`
*   If you encounter `ModuleNotFoundError: No module named 'pydantic_settings'`, fix it by running:

    ```bash
    python -m pip install pydantic-settings
    ```
*   Run the server:

    ```bash
    python -m uvicorn app.main:app --reload
    ```

### Frontend Setup

*   Install Node.js 18+
*   Navigate to the `frontend/` directory and run:

    ```bash
    npm install
    npm run dev
    ```
*   If you encounter the error `'vite' is not recognized`, fix it by running:

    ```bash
    npm install vite --save-dev
    ```

### Common Errors & Fixes

*   **Python module not found**: Check your virtual environment setup, install the missing package, and update `requirements.txt`.
*   **Vite not found**: Ensure you are in the `frontend/` directory, run `npm install`, or explicitly install `vite` as a dev dependency (`npm install vite --save-dev`).
*   **Backend/frontend connection issues**: Verify the `baseURL` in `frontend/src/api/index.js` or your `.env` file matches the backend server address (`http://localhost:8000` or `http://127.0.0.1:8000`).

## Progress Log

- [2025-09-05] Implemented Tax Management module (summary, deductions, suggestions).
- [2025-09-05] Implemented Investments module (CRUD + performance analysis).
- [2025-09-09] Implemented Forecasting Module (Phase 4): expense, income, and cashflow prediction endpoints with ML-based services.
- [2025-09-11] Implemented Recommendations Module (Phase 5): added endpoints for expenses, tax, investments, and cashflow suggestions.
- [2025-09-11] Implemented frontend–backend API integration layer with Axios and JWT handling.
- [2025-09-11] Added Setup & Troubleshooting guide to README.md.
