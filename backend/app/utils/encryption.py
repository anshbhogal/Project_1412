from cryptography.fernet import Fernet
from ..config import settings
from typing import Optional

# Initialize Fernet with the key from settings
try:
    f = Fernet(settings.FERNET_KEY.encode())
except Exception as e:
    print(f"Error initializing Fernet: {e}. Please ensure FERNET_KEY is a valid base64-encoded 32-byte key.")
    f = None # Handle error gracefully, perhaps raise a more specific exception

def encrypt_field(data: Optional[str]) -> Optional[str]:
    if data is None:
        return None
    if f is None:
        raise ValueError("Fernet key not initialized. Cannot encrypt.")
    return f.encrypt(data.encode()).decode()

def decrypt_field(encrypted_data: Optional[str]) -> Optional[str]:
    if encrypted_data is None:
        return None
    if f is None:
        raise ValueError("Fernet key not initialized. Cannot decrypt.")
    try:
        return f.decrypt(encrypted_data.encode()).decode()
    except Exception as e:
        print(f"Decryption error: {e}")
        return None # Or raise a specific decryption error
