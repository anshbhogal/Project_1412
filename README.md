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

## Progress Log

- [2025-09-05] Implemented Tax Management module (summary, deductions, suggestions).
