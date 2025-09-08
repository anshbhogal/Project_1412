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

## Progress Log

- [2025-09-05] Implemented Tax Management module (summary, deductions, suggestions).
- [2025-09-05] Implemented Investments module (CRUD + performance analysis).
