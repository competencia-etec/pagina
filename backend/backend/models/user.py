
class User:
    def __init__(self, username: str,
                 full_name: str,
                 email: str,
                 hashed_password: str,
                 disabled: bool = False,
                 ) -> None:

        self.username = username
        self.full_name = full_name
        self.email = email
        self.hashed_password = hashed_password
        self.disabled = disabled

    def __repr__(self) -> str:
        return (f"""User:
        {self.username},
        {self.full_name},
        {self.email},
        {self.hashed_password},
        {self.disabled}
                """)
