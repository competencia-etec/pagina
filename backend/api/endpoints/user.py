from fastapi import APIRouter, Depends
from backend.api.dependencies import get_current_user
from backend.models.user import User
from backend.schemas.user import UserResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
