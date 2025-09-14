from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routes import auth, transactions, investments, forecasts, recommendations, tax, financial_summary

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Financial Management Dashboard API",
    description="API for managing personal finances, transactions, investments, and tax-related data.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],  # Adjust for your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
app.include_router(investments.router, prefix="/investments", tags=["Investments"])
app.include_router(forecasts.router, prefix="/forecasts", tags=["Forecasts"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
app.include_router(tax.router, prefix="/tax", tags=["Tax"])
app.include_router(financial_summary.router, prefix="/summary", tags=["Financial Summary"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Financial Management Dashboard API!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}