

from pydantic import BaseModel


class User(BaseModel):
    def __init__(self, username: str,
                 full_name: str,
                 email: str,
                 disabled: bool = False,
                 ) -> None:

        self.username = username
        self.full_name = full_name
        self.email = email
        self.disabled = disabled

    def __repr__(self) -> str:
        return (f"""User:
        {self.username},
        {self.full_name},
        {self.email},
        {self.disabled}
                """)


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class UserInDB(User):
    hashed_password: str
