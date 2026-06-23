from fastapi import FastAPI

from backend.api.endpoints.auth import add_endpoints as add_auth_endpoints
from backend.api.endpoints.user import add_endpoints as add_user_endpoints
from backend.core.config import EnvirometConfig
from backend.services.database import DatabaseConnection


app = FastAPI()

# Load env file
config = EnvirometConfig()
config.load_env_file()

# Testing
db = DatabaseConnection()
db.init("sqlite+pysqlite:///:memory:", True)
db.add_user("pepe", "pepardo", "pepe@tumama.com", "fake_password")
print(db.get_user("pepe"))


add_auth_endpoints(app)
add_user_endpoints(app)
