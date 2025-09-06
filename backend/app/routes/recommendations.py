from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_recommendations_root():
    return {"message": "Recommendations route"}
