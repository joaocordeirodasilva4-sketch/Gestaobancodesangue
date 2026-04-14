from decouple import config

# API
API_V1_STR: str = "/api/v1"
SECRET_KEY: str = config("SECRET_KEY", default="your-secret-key-here")
ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

# Database
SQLALCHEMY_DATABASE_URL: str = config("DATABASE_URL", default="sqlite:///./hemolife.db")

class Settings:
    api_v1_str: str = API_V1_STR
    secret_key: str = SECRET_KEY
    access_token_expire_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES
    sqlalchemy_database_url: str = SQLALCHEMY_DATABASE_URL

settings = Settings()