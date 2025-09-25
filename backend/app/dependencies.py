
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from .database import SessionLocal
from .schemas import schemas
from .models.models import User
from .utils.auth import oauth2_scheme
from .config import settings
from .utils import auth_utils

# DB session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Current user dependency for authentication
def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth_utils.verify_access_token(token)
        if payload is None:
            raise credentials_exception
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user
