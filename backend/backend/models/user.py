from pydantic import BaseModel, EmailStr, Field


class User(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str | None = None
    email: EmailStr
    hashed_password: str | None
    disabled: bool = False
    oauth_signed: bool = False


class CreateUser(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str | None = None
    email: EmailStr
    unhashed_password: str | None = None
    disabled: bool = False
    oauth_signed: bool = False


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: EmailStr
