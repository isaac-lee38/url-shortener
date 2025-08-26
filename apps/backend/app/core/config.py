from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY_FOR_SIGNING_SHORTURL: str

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
print(f"DATABASE_URL from .env: {settings.DATABASE_URL}")