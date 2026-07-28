from fastapi import APIRouter, FastAPI

from backend.api.endpoints.auth import add_endpoints as add_auth_endpoints
from backend.api.endpoints.user import add_endpoints as add_user_endpoints
from backend.api.endpoints.wordle import add_endpoints as add_wordle_endpoint
from backend.core.config import EnviromentConfig
from backend.services.database import DatabaseConnection


app = FastAPI()
router = APIRouter()

# Load env file
config = EnviromentConfig()
config.load_env_file()

# Testing
db = DatabaseConnection()
# db.init("sqlite+pysqlite:///:memory:", True)
db.init("sqlite:///foo.db", True)


add_auth_endpoints(router)
add_user_endpoints(router)
add_wordle_endpoint(router)

app.include_router(router)
