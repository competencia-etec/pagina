from fastapi import APIRouter, FastAPI

from backend.api.endpoints.auth import add_endpoints as add_auth_endpoints
from backend.api.endpoints.maze import add_endpoints as add_maze_endpoints
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


auth_router = APIRouter()
user_router = APIRouter(prefix="/user")
game_router = APIRouter()

add_auth_endpoints(auth_router)
add_user_endpoints(user_router)
add_wordle_endpoint(game_router)
add_maze_endpoints(game_router)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(game_router)
