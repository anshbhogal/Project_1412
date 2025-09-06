from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_tax_root():
    return {"message": "Tax route"}
