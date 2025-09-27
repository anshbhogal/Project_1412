from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .database import engine, Base
from .routes import auth, financial_summary, transactions, investments, tax, forecasting, recommendations, report_routes, chatbot
from .dependencies import verify_jwt_token

Base.metadata.create_all(bind=engine)

class JWTAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow unauthenticated access to auth routes and docs
        if request.url.path.startswith("/auth") or \
           request.url.path.startswith("/docs") or \
           request.url.path.startswith("/redoc") or \
           request.url.path.startswith("/openapi.json"):
            response = await call_next(request)
            return response

        # For other routes, validate the JWT token
        try:
            # This is a simplified check. In a real app, you'd use a dependency
            # injector or a more robust way to validate the token without a route.
            # For middleware, we'll directly extract and verify
            token = request.headers.get("Authorization")
            if not token:
                raise StarletteHTTPException(status_code=401, detail="Not authenticated")
            scheme, param = token.split(" ")
            if scheme.lower() != "bearer":
                raise StarletteHTTPException(status_code=401, detail="Not authenticated")
            # Assuming verify_jwt_token can be called without FastAPI's Depends context
            # This requires verify_jwt_token to be refactored to not use Depends(oauth2_scheme)
            # or for us to mock the dependency during middleware execution. For now, a direct
            # call to auth_utils.verify_access_token is more appropriate in middleware.
            from .utils import auth as auth_utils # Import locally to avoid circular dependency if verify_jwt_token uses it
            payload = auth_utils.verify_access_token(param)
            if payload is None:
                raise StarletteHTTPException(status_code=401, detail="Invalid authentication credentials")
            
            # You might want to store the user info in request.state for later access in routes
            request.state.user_email = payload.get("sub")
            
        except StarletteHTTPException as e:
            return JSONResponse(status_code=e.status_code, content={"detail": e.detail})
        except Exception as e:
            return JSONResponse(status_code=500, content={"detail": f"Internal server error: {e}"})

        response = await call_next(request)
        return response

app = FastAPI(
    title="Financial Management Dashboard API",
    description="API for managing personal finances, transactions, investments, and tax-related data.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"], # Explicitly allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(JWTAuthMiddleware)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(financial_summary.router, prefix="/summary", tags=["Financial Summary"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
app.include_router(investments.router, prefix="/investments", tags=["Investments"])
app.include_router(tax.router, prefix="/tax", tags=["Tax"])
app.include_router(forecasting.router, prefix="/forecasting", tags=["Forecasts"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
app.include_router(report_routes.router, prefix="/reports", tags=["Reports"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Financial Management Dashboard API!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}