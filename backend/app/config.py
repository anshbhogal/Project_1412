import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://user:password@localhost:5432/finance_db"
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DB_URL: str = os.getenv("DB_URL", "postgresql+psycopg2://user:password@localhost:5432/finance_app")

    # Tax Configuration
    TAX_BASIC_EXEMPTION_LIMIT: float = 250000.0
    TAX_STANDARD_DEDUCTION: float = 50000.0
    TAX_80C_CAP: float = 150000.0
    TAX_SLABS: list = [
        {"limit": 250000, "rate": 0.00},
        {"limit": 500000, "rate": 0.05},
        {"limit": 1000000, "rate": 0.20},
        {"limit": float('inf'), "rate": 0.30},
    ]


settings = Settings()
