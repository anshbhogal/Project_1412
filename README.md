# 💰 Personal Finance Dashboard

[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Frontend: React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![UI: Shadcn/ui](https://img.shields.io/badge/UI-Shadcn%2Fui-000000?style=for-the-badge&logo=shadcn%2Fui)](https://ui.shadcn.com/)
[![Styling: Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Charting: Recharts](https://img.shields.io/badge/Charting-Recharts-8884d8?style=for-the-badge&logo=recharts)](https://recharts.org/)
[![Animation: Framer Motion](https://img.shields.io/badge/Animation-Framer_Motion-purple?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

A robust, full-stack personal finance management application designed to empower users with intelligent tools for tracking, analyzing, and optimizing their financial health. Built with a FastAPI backend and a modern React frontend leveraging `shadcn/ui`, Tailwind CSS, Recharts, and Framer Motion for a seamless and intuitive user experience.

---

## ✨ Features

-   **Comprehensive Financial Tracking**: Monitor income, expenses, and investments with interactive dashboards and detailed transaction history.
-   **Taxation Module**:
    -   Detailed tax summary and liability breakdown.
    -   Identification and visualization of potential tax deductions.
    -   Insights into tax savings opportunities.
-   **AI-Powered Financial Forecasting**:
    -   Utilizes the Prophet library for accurate future financial projections (e.g., savings, cash flow).
    -   Visualizes future trends to aid in financial planning.
-   **AI Chatbot for Tax Queries**:
    -   An intelligent chatbot capable of answering questions related to tax terms and financial regulations (e.g., "What is 80C?", "How does 80D work?").
-   **Advanced Cybersecurity**:
    -   Secure JWT (JSON Web Token) authentication for user sessions.
    -   Implementation of 2-Factor Authentication (2FA) for enhanced account security.
    -   Robust encryption protocols to protect sensitive financial data.
-   **AI-Powered Fraud Detection**:
    -   Integrates an IsolationForest model to detect anomalous transactions.
    -   Dedicated FastAPI endpoint (`/api/fraud/check`) for real-time fraud assessment.

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   Python 3.8+
-   Node.js (LTS) or [Bun](https://bun.sh/docs/installation) (recommended for frontend)
-   MySQL Server (with a database named `finance_db` and a user `root` with password `root` - these can be configured in `backend/app/config.py`)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/personal-finance-dashboard.git
cd personal-finance-dashboard
```

### 2. Backend Setup

Navigate to the `backend` directory, create a Python virtual environment, install dependencies, and run the server.

```bash
cd backend
python -m venv venv
# On Windows
.\venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
pip install -r requirements-lock.txt

# Run the backend server
uvicorn app.main:app --reload --port 8000
```

The backend API will be accessible at `http://localhost:8000`.

### 3. Frontend Setup

Open a *new* terminal, navigate to the `frontend` directory, install dependencies, and start the development server.

```bash
cd frontend
# Using Bun (recommended)
bun install
bun run dev

# Using npm
# npm install
# npm run dev
```

The frontend application will typically be accessible at `http://localhost:5173` (or similar, check your terminal output).

### 4. Training the Fraud Detection Model (Optional)

To train the IsolationForest model for fraud detection:

```bash
python backend/app/ml/train_fraud_model.py
```

This script will train the model and save it for use by the FastAPI application.

---

## 📸 Screenshots & Demos

_Placeholder for project screenshots or GIFs demonstrating key features._
_Please add images to the `/assets/screenshots` directory and link them here._

---

## 📝 API Endpoints (Brief Overview)

-   `POST /api/forecasting/predict`: Generate financial forecasts based on historical data.
-   `POST /api/fraud/check`: Submit transaction data for real-time fraud detection.
-   `GET /api/tax/...`: Access various tax-related summaries and calculations.
-   `POST /api/chatbot/tax`: Interact with the AI chatbot for tax term explanations.
-   `POST /api/auth/signup`: User registration.
-   `POST /api/auth/login`: User authentication.
-   `POST /api/auth/2fa/verify`: Verify 2FA code.
-   `GET /api/transactions/`: Retrieve user transactions.
-   `POST /api/transactions/`: Add a new transaction.
-   `PUT /api/transactions/{transaction_id}`: Update an existing transaction.
-   `DELETE /api/transactions/{transaction_id}`: Delete a transaction.
-   `GET /api/investments/`: Retrieve user investments.
-   `GET /api/recommendations/`: Get AI-driven financial recommendations.

---

## 🛣️ Future Roadmap

-   **Enhanced ML Modules**: Integration of more advanced machine learning models for personalized financial recommendations, anomaly detection beyond fraud, and predictive analytics.
-   **Stronger Security Integrations**: Explore advanced security features like biometric authentication, hardware token support, and more robust intrusion detection systems.
-   **Gamified Finance Goals**: Introduce gamification elements to make achieving financial goals more engaging and rewarding.
-   **Budgeting Tools**: Advanced budgeting features with customizable categories and alerts.
-   **Multi-currency Support**: Allow users to manage finances in multiple currencies.

---

## 🤝 Contributing

Contributions are welcome! Please follow standard GitHub practices: fork the repository, create a new branch for your features or bug fixes, and submit a pull request. Ensure your code adheres to the project's coding standards and includes appropriate tests.

---

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
