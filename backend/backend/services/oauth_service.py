from datetime import timedelta, timezone, datetime

import jwt

from backend.core.config import EnviromentConfig


def create_access_token(data: dict, expires_delta: timedelta | None = None):
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
