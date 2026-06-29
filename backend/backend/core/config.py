import os
from dotenv import load_dotenv


class EnviromentConfig():
    instance = None

    def __new__(cls):
        if cls.instance is None:
            cls.instance = super().__new__(cls)
        return cls.instance

    def load_env_file(self, path: str | None = None):
        load_dotenv(path)

    def get_config_var(self, key: str) -> str:
        val = os.getenv(key)
        if val is None:
            raise RuntimeError(f"ENV varialbe {key} not found!")
        return val
