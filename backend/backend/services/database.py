from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from backend.core import logger
from backend.models.user import User


class DatabaseConnection:
    instance = None

    def __new__(cls):
        if cls.instance is None:
            cls.instance = super().__new__(cls)
        return cls.instance

    def init(self, url: str, echo: bool = False) -> None:
        try:
            self.engine = create_engine(url, echo=echo)
            stmt = text("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) NOT NULL,
                    full_name VARCHAR(100),
                    email VARCHAR(255) UNIQUE NOT NULL,
                    hashed_password VARCHAR(255),
                    disabled BOOLEAN DEFAULT FALSE NOT NULL,
                    oauth_signed BOOLEAN DEFAULT FALSE NOT NULL
                );
            """)
            with Session(self.engine) as session:
                session.execute(stmt)
                session.commit()
                logger.logger.info("Database initialized successfully.")
        except SQLAlchemyError as e:
            logger.logger.critical(
                f"Failed to connect or initialize database: {e}")
            raise

    def get_user_by_username(self, username: str) -> User | None:
        stmt = text("SELECT * FROM users WHERE username = :username")
        try:
            with Session(self.engine) as session:
                result = session.execute(stmt, {"username": username})
                user_mapping = result.mappings().fetchone()
                if user_mapping is None:
                    return None

                return User(
                    username=user_mapping["username"],
                    full_name=user_mapping["full_name"],
                    email=user_mapping["email"],
                    hashed_password=user_mapping["hashed_password"],
                    disabled=user_mapping.get("disabled", False),
                )
        except SQLAlchemyError as e:
            logger.logger.error(f"Error fetching user '{username}': {e}")
            raise

    def get_user_by_email(self, email: str) -> User | None:
        stmt = text("SELECT * FROM users WHERE email = :email")
        try:
            with Session(self.engine) as session:
                result = session.execute(stmt, {"email": email})
                user_mapping = result.mappings().fetchone()
                if user_mapping is None:
                    return None

                return User(
                    username=user_mapping["username"],
                    full_name=user_mapping["full_name"],
                    email=user_mapping["email"],
                    hashed_password=user_mapping["hashed_password"],
                    disabled=user_mapping.get("disabled", False),
                )
        except SQLAlchemyError as e:
            logger.logger.error(f"Error fetching user '{email}': {e}")
            raise

    def add_user(self,
                 username: str,
                 full_name: str | None,
                 email: str,
                 hashed_password: str | None,
                 disabled: bool = False,
                 oauth_signed: bool = False
                 ) -> None:
        """Create user in DB. Throws IntegrityError or SQLAlchemyError if it fails."""
        full_name = "" if full_name is None else full_name

        stmt = text("""
            INSERT INTO users (username, full_name, email, hashed_password, disabled, oauth_signed)
            VALUES (:username, :full_name, :email, :hashed_password, :disabled, :oauth_signed)
        """)

        with Session(self.engine) as session:
            session.execute(stmt, {
                "username": username,
                "full_name": full_name,
                "email": email,
                "hashed_password": hashed_password,
                "disabled": disabled,
                "oauth_signed": oauth_signed
            })
            session.commit()

    def update_user_status(self, username: str, disabled: bool) -> bool:
        """Update a user's disabled status."""
        stmt = text(
            "UPDATE users SET disabled = :disabled WHERE username = :username")
        try:
            with Session(self.engine) as session:
                result = session.execute(
                    stmt, {"username": username, "disabled": disabled})
                session.commit()
                return result.rowcount > 0
        except SQLAlchemyError as e:
            logger.logger.error(f"Error updating status for '{username}': {e}")
            return False

    def delete_user(self, username: str) -> bool:
        """Remove a user from the database."""
        stmt = text("DELETE FROM users WHERE username = :username")
        try:
            with Session(self.engine) as session:
                result = session.execute(stmt, {"username": username})
                session.commit()
                return result.rowcount > 0
        except SQLAlchemyError as e:
            logger.logger.error(f"Error deleting user '{username}': {e}")
            return False

    def close(self) -> None:
        """Gracefully dispose of the connection pool."""
        self.engine.dispose()
        logger.logger.info("Database connection closed.")
