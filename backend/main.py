from fastapi import FastAPI
from backend.core.database import engine, Base
from backend.api.endpoints import auth, user

# Create SQLite database and tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="OAuth API Starter")

# Register routes
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(user.router, prefix="/users", tags=["Users"])
