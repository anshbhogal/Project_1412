from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_investments_root():
    return {"message": "Investments route"}
