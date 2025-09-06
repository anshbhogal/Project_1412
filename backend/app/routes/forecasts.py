from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_forecasts_root():
    return {"message": "Forecasts route"}
