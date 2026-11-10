
from pydantic import BaseModel, EmailStr


class GoogleOAuthResponse(BaseModel):
    id: int | str
    email: EmailStr
    name: str = ""
    given_name: str = ""
    family_name: str = ""
    picture: str = ""
