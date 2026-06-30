from fastapi import FastAPI

from backend.api.endpoints.auth import add_endpoints as add_auth_endpoints
from backend.api.endpoints.user import add_endpoints as add_user_endpoints
from backend.core.config import EnviromentConfig
from backend.services.database import DatabaseConnection


app = FastAPI()

# Load env file
config = EnviromentConfig()
config.load_env_file()

# Testing
db = DatabaseConnection()
db.init("sqlite+pysqlite:///:memory:", True)
db.add_user("pepe", "pepardo", "pepe@tumama.com", "secret")
print(db.get_user_by_email("pepe@tumama.com"))


add_auth_endpoints(app)
add_user_endpoints(app)
