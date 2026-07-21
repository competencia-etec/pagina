from datetime import timedelta, timezone, datetime

import json
import urllib.parse
import urllib.request

import jwt

from backend.core.config import EnviromentConfig
from backend.models.oauth_response import GoogleOAuthResponse


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Creates JWT"""
    env = EnviromentConfig()
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, env.get_config_var(
        "SECRET_KEY"), algorithm=env.get_config_var("ALGORITHM"))
    return encoded_jwt


def oauth_callback(code: str) -> GoogleOAuthResponse:
    """Handle Oauth return code"""

    token_url = "https://oauth2.googleapis.com/token"
    payload = urllib.parse.urlencode({
        "client_id":
            EnviromentConfig().get_config_var("OAUTH_CLIENT_ID"),
        "client_secret":
            EnviromentConfig().get_config_var("OAUTH_CLIENT_SECRET"),
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri":
            EnviromentConfig().get_config_var("OAUTH_REDIRECT_URI")
    }).encode("utf-8")

    req = urllib.request.Request(token_url, data=payload, method="POST")
    with urllib.request.urlopen(req) as response:
        token_info = json.loads(response.read())

    access_token = token_info.get("access_token")

    userinfo_url = f"https://www.googleapis.com/oauth2/v1/userinfo?access_token={
        access_token}"
    with urllib.request.urlopen(userinfo_url) as response:
        user_info = json.loads(response.read())

    return GoogleOAuthResponse(**user_info)
