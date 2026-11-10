import urllib.parse

from fastapi import HTTPException, Request
from fastapi.responses import RedirectResponse

from backend.core.config import EnviromentConfig
from backend.models import oauth_response
from backend.models.user import CreateUser, Token, User
from backend.services.oauth_service import create_access_token, oauth_callback
from backend.services.user_service import create_user, get_user_by_email

import re

ACCESS_TOKEN_EXPIRE_MINUTES = 30


def add_endpoints(router):
    @router.get("/login_oauth", tags=["auth"])
    async def login_with_oauth(request: Request):
        """Loging auth endpoint"""
        env = EnviromentConfig()
        frontend_callback = env.get_config_var("FRONTEND_CALLBACK_URL").strip()

        referer = request.headers.get("referer")
        if referer:
            parsed = urllib.parse.urlparse(referer)
            if parsed.scheme in ("http", "https") and parsed.netloc:
                frontend_callback = f"{parsed.scheme}://{parsed.netloc}/oauth2redirect"

        params = {
            "client_id": env.get_config_var("OAUTH_CLIENT_ID").strip(),
            "redirect_uri": env.get_config_var("OAUTH_REDIRECT_URI").strip(),
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "state": frontend_callback,
        }
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{
            urllib.parse.urlencode(params)}"
        return RedirectResponse(auth_url)

    @router.get("/oauth_callback", tags=["auth"])
    async def callback(code: str, state: str | None = None):
        """Callback for oauth loggin"""
        oauth_user: oauth_response.GoogleOAuthResponse = oauth_callback(code)
        env = EnviromentConfig()

        pattern = re.compile(r"^[a-zA-Z0-9._%+-]+@alumno\.etec\.um\.edu\.ar$")
        if not pattern.match(oauth_user.email):
            raise HTTPException(
                401, "Invalid email, only `alumno.etec.um.edu.ar` hosts are accepted")

        user: User | None = get_user_by_email(oauth_user.email)

        if user is None:
            creating_user = CreateUser(
                username=oauth_user.name or oauth_user.email.split("@")[0],
                full_name=" ".join(
                    part for part in (oauth_user.given_name, oauth_user.family_name) if part
                ) or oauth_user.name or None,
                email=oauth_user.email,
                disabled=False
            )
            user = await create_user(creating_user)

        tk = create_access_token({"sub": user.email})

        frontend_callback = env.get_config_var("FRONTEND_CALLBACK_URL").strip()
        if state:
            parsed = urllib.parse.urlparse(state)
            if parsed.scheme in ("http", "https") and parsed.netloc:
                frontend_callback = state

        return RedirectResponse(f"{frontend_callback}?token={tk}")
