from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    BASE_URL: str = "http://localhost:8000"

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
print(f"DATABASE_URL from .env: {settings.DATABASE_URL}")