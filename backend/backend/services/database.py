import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from backend.models.user import User


# Configure standard logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseConnection:
    def __init__(self, url: str, echo: bool = False) -> None:
        try:
            self.engine = create_engine(url, echo=echo)

            stmt = text("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    full_name VARCHAR(100) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    hashed_password VARCHAR(255) NOT NULL,
                    disabled BOOLEAN DEFAULT FALSE NOT NULL
                );
            """)
            with Session(self.engine) as session:
                session.execute(stmt)
                session.commit()
                logger.info("Database initialized successfully.")

        except SQLAlchemyError as e:
            logger.critical(f"Failed to connect or initialize database: {e}")
            raise

    def get_user(self, username: str) -> User | None:
        stmt = text("SELECT * FROM users WHERE username = :username")
        try:
            with Session(self.engine) as session:
                result = session.execute(stmt, {"username": username})
                user_mapping = result.mappings().fetchone()
                if (user_mapping is None):
                    return None

                user = User(user_mapping["username"],
                            user_mapping["full_name"],
                            user_mapping["email"],
                            user_mapping["hashed_password"],
                            user_mapping["disabled"],
                            )
                return user
        except SQLAlchemyError as e:
            logger.error(f"Error fetching user '{username}': {e}")
            return None

    def add_user(self, username: str, full_name: str, email: str, hashed_password: str, disabled: bool = False) -> bool:
        """Create user in DB"""
        stmt = text("""
            INSERT INTO users (username, full_name, email, hashed_password, disabled) 
            VALUES (:username, :full_name, :email, :hashed_password, :disabled)
        """)
        try:
            with Session(self.engine) as session:
                session.execute(stmt, {
                    "username": username,
                    "full_name": full_name,
                    "email": email,
                    "hashed_password": hashed_password,
                    "disabled": disabled
                })
                session.commit()
                return True
        except IntegrityError:
            logger.warning(f"Integrity Error: Username '{
                           username}' or email '{email}' already exists.")
            return False
        except SQLAlchemyError as e:
            logger.error(f"Database error while adding user '{username}': {e}")
            return False

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
            logger.error(f"Error updating status for '{username}': {e}")
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
            logger.error(f"Error deleting user '{username}': {e}")
            return False

    def close(self) -> None:
        """Gracefully dispose of the connection pool."""
        self.engine.dispose()
        logger.info("Database connection closed.")


if __name__ == "__main__":
    # Testing
    db = DatabaseConnection("sqlite+pysqlite:///:memory:", False)
    db.add_user("pepe", "pepardo", "pepe@tumama.com", "&#(*$&df")
    print(db.get_user("pepe"))
    db.close()
