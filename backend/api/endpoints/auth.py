from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api.dependencies import get_db
from backend.schemas.user import Token
from backend.services.oauth_service import verify_oauth_code
from backend.services.user_service import get_or_create_oauth_user
from backend.core.security import create_access_token

router = APIRouter()


@router.post("/callback", response_model=Token)
def oauth_callback(code: str, provider: str = "google", db: Session = Depends(get_db)):
    try:
        # 1. Swap code for profile
        profile = verify_oauth_code(code, provider)
        # 2. Find or create user in SQLite
        user = get_or_create_oauth_user(db, profile)
        # 3. Issue our own internal JWT
        access_token = create_access_token(data={"sub": str(user.id)})

        return {"access_token": access_token, "token_type": "bearer"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid OAuth Code")
