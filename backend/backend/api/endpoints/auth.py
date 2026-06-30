from datetime import timedelta
from typing import Annotated
import urllib.parse

from fastapi import Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from starlette.status import HTTP_400_BAD_REQUEST

from backend.core.config import EnviromentConfig
from backend.models import oauth_response
from backend.models.user import CreateUser, Token, User
from backend.services.oauth_service import create_access_token, oauth_callback
from backend.services.user_service import authenticate_user, create_user, get_user_by_email

ACCESS_TOKEN_EXPIRE_MINUTES = 30


def add_endpoints(app):
    @app.post("/login_credentials")
    async def loging_with_credentials(
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    ) -> Token:
        user = authenticate_user(
            form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return Token(access_token=access_token, token_type="bearer")

    @app.get("/login_oauth")
    async def login_with_oauth():
        params = {
            "client_id": EnviromentConfig().get_config_var("OAUTH_CLIENT_ID"),
            "redirect_uri": EnviromentConfig().get_config_var("OAUTH_REDIRECT_URI"),
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline"
        }
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{
            urllib.parse.urlencode(params)}"
        return RedirectResponse(auth_url)

    @app.get("/callback")
    async def callback(code: str):
        oauth_user: oauth_response.GoogleOAuthResponse = oauth_callback(code)

        user: User | None = get_user_by_email(oauth_user.email)

        if user is None:
            creating_user = CreateUser(
                username=oauth_user.name,
                full_name=oauth_user.given_name + oauth_user.family_name,
                email=oauth_user.email,
                unhashed_password=None,
                oauth_signed=True,
                disabled=False
            )
            user = await create_user(creating_user)

        tk = create_access_token({"sub": user.email})

        return Token(access_token=tk)
