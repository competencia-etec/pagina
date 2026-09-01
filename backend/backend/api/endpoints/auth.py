import urllib.parse
import logging

from fastapi.responses import RedirectResponse

from backend.core.config import EnviromentConfig
from backend.models import oauth_response
from backend.models.user import CreateUser, Token, User
from backend.services.oauth_service import create_access_token, oauth_callback
from backend.services.user_service import create_user, get_user_by_email

logger = logging.getLogger(__name__)

ACCESS_TOKEN_EXPIRE_MINUTES = 30
## FIX: Move to .env
FRONTEND_CALLBACK_URL = "http://localhost:5173/oauth2redirect"
FRONTEND_LOGIN_URL = "http://localhost:5173/login"


def add_endpoints(router):
    @router.get("/login_oauth", tags=["auth"])
    async def login_with_oauth():
        """Loging auth endpoint"""
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

    @router.get("/oauth_callback", tags=["auth"])
    async def callback(code: str):
        """Callback for oauth loggin"""
        try:
            oauth_user: oauth_response.GoogleOAuthResponse = oauth_callback(code)

            user: User | None = get_user_by_email(oauth_user.email)

            if user is None:
                username = oauth_user.name
                if not username or len(username) < 3:
                    username = oauth_user.given_name or oauth_user.email.split("@")[0]
                
                full_name_parts = []
                if oauth_user.given_name:
                    full_name_parts.append(oauth_user.given_name)
                if oauth_user.family_name:
                    full_name_parts.append(oauth_user.family_name)
                full_name = " ".join(full_name_parts) if full_name_parts else username

                creating_user = CreateUser(
                    username=username,
                    full_name=full_name,
                    email=oauth_user.email,
                    disabled=False
                )
                user = await create_user(creating_user)

            tk = create_access_token({"sub": user.email})

            return RedirectResponse(f"{FRONTEND_CALLBACK_URL}?token={tk}")
        except Exception as e:
            logger.error(f"OAuth callback failed: {e}")
            return RedirectResponse(f"{FRONTEND_LOGIN_URL}?error=oauth_failed")
