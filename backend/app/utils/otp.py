from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from ..config import settings

def create_otp_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.OTP_SECRET, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_otp_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.OTP_SECRET, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
