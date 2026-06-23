from fastapi import FastAPI

from backend.api.endpoints.auth import add_endpoints as add_auth_endpoints
from backend.api.endpoints.user import add_endpoints as add_user_endpoints
from backend.services.database import DatabaseConnection


fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": "$argon2id$v=19$m=65536,t=3,p=4$wagCPXjifgvUFBzq4hqe3w$CYaIb8sB+wtD+Vu/P4uod1+Qof8h+1g7bbDlBID48Rc",
        "disabled": False,
    }
}

app = FastAPI()

# Testing
db = DatabaseConnection()
db.init("sqlite+pysqlite:///:memory:", True)
db.add_user("pepe", "pepardo", "pepe@tumama.com", "fake_password")
print(db.get_user("pepe"))


add_auth_endpoints(app, fake_users_db=fake_users_db)
add_user_endpoints(app)
