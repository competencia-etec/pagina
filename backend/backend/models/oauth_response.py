
from pydantic import BaseModel, EmailStr


class GoogleOAuthResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    given_name: str | None = None
    family_name: str | None = None
    picture: str | None = None
