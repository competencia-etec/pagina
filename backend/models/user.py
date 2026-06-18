from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.core.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)

    oauth_accounts = relationship("OAuthAccount", back_populates="user")


class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    provider = Column(String, index=True)  # e.g., "google", "github"
    provider_account_id = Column(String, index=True)  # ID from provider

    user = relationship("User", back_populates="oauth_accounts")
