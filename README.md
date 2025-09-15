# Financial Management Dashboard

A comprehensive financial management dashboard designed to help users track income, expenses, investments, and tax liabilities with intuitive visualizations and an easy-to-use interface.

## Features

*   **User Authentication**: Secure signup and login system.
*   **Dashboard Overview**:
    *   Key Performance Indicators (KPIs) for income, expenses, net savings, investment value, and tax liability.
    *   Interactive charts for monthly income vs. expenses trend and expense breakdown.
    *   Backend health check indicator.
    *   Month and year selection to filter dashboard data.
*   **Transaction Management**:
    *   View, add, update, and delete transactions.
    *   Manual input for salary, expenses, and investments with date selection.
    *   Upload transactions via CSV/Excel file.
*   **Tax Summary**: Overview of tax liability and breakdown.
*   **Investments Tracking**: Monitor investment performance with sparkline charts.
*   **Financial Forecasts**: Project future savings and cash flow.
*   **Recommendations**: AI-driven insights for financial optimization.
*   **Reports**: Generate financial reports.
*   **Responsive Design**: Optimized for various screen sizes, including mobile.
*   **Currency**: All financial values displayed in **INR (₹)**.

## Technologies Used

### Frontend
*   **React**: A JavaScript library for building user interfaces.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
*   **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
*   **Shadcn/ui**: Re-usable components built using Tailwind CSS and Radix UI.
*   **Framer Motion**: A production-ready motion library for React.
*   **Recharts**: A composable charting library built on React components.
*   **date-fns**: A modern JavaScript date utility library.
*   **React Router Dom**: For declarative routing in React applications.
*   **Axios**: Promise-based HTTP client for the browser and node.js.
*   **@tanstack/react-query**: For data fetching, caching, and state management.

### Backend
*   **FastAPI**: A modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.
*   **SQLAlchemy**: The Python SQL toolkit and Object Relational Mapper.
*   **Pydantic**: Data validation and settings management using Python type hints.
*   **MySQL**: The relational database used for data storage.
*   **PyMySQL**: MySQL database connector for Python.
*   **Passlib**: For password hashing.
*   **Python-jose**: For JSON Web Tokens (JWT) handling.
*   **Uvicorn**: An ASGI web server for Python.
*   **Pandas**: For data manipulation, especially useful for CSV/Excel file processing.
*   **Openpyxl**: For reading and writing Excel 2010 xlsx/xlsm/xltx/xltm files.

## Setup and Installation

Follow these steps to get the project up and running on your local machine.

### Prerequisites

*   Python 3.8+
*   Node.js (LTS) or [Bun](https://bun.sh/docs/installation) (recommended for frontend)
*   MySQL Server (with a database named `finance_db` and a user `root` with password `root`)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/financial-management-dashboard.git
cd financial-management-dashboard
```

### 2. Backend Setup

Navigate to the `backend` directory, create a Python virtual environment, install dependencies, and run migrations.

```bash
cd backend
python -m venv venv
# On Windows
.\venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
pip install -r requirements-lock.txt # Ensure all dependencies are covered

# Ensure your MySQL server is running and the 'finance_db' database exists.
# If you haven't created it, log into MySQL and run: CREATE DATABASE finance_db;

# Run database migrations (if using Alembic, otherwise models are created on startup)
# Alembic setup is beyond this README's scope, but models will be created by FastAPI on first run.
# For manual table creation on first run with FastAPI, ensure Base.metadata.create_all(bind=engine) is uncommented in main.py

# Run the backend server
uvicorn app.main:app --reload --port 8000
```
The backend server will run on `http://localhost:8000`.

### 3. Frontend Setup

Open a new terminal, navigate to the `frontend` directory, install dependencies, and start the development server.

```bash
cd ../frontend
# Using Bun (recommended)
bun install
bun run dev

# Using npm
# npm install
# npm run dev
```
The frontend application will typically be accessible at `http://localhost:8080` (or `http://10.13.52.179:8080` if accessing from other devices on your local network).

## Usage

1.  **Register**: Navigate to the `/signup` page to create a new user account.
2.  **Login**: Use your registered credentials on the `/login` page.
3.  **Dashboard**: After logging in, you will be redirected to the dashboard, showing your financial overview.
4.  **Add Financial Input**: Use the "Manual Financial Input" card on the dashboard to add your monthly salary, expenses, and investments. Select the month and year, then click "Save". These will be saved as transactions.
5.  **Explore**: Navigate through different sections using the sidebar (Transactions, Tax Summary, Investments, Forecasts, Recommendations, Reports).

## Design Notes

*   **Rounded Corners**: `rounded-2xl` is used throughout the UI for a modern, soft aesthetic.
*   **Soft Shadows**: `shadow-md` is applied to cards and key elements to give depth without being overly heavy.
*   **Animations**: `Framer Motion` is integrated for smooth transitions, fade-in, and slide-in effects.
*   **Charts**: `Recharts` provides interactive and customizable data visualizations.
*   **Color Palette**: A modern, clean, finance-friendly palette with a primary blue, accent cyan, and subtle grayscale for backgrounds and text.

## Contributing

Contributions are welcome! Please follow standard GitHub practices: fork the repository, create a new branch for your features or bug fixes, and submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
