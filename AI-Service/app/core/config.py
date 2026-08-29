from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    tmdb_api_key: str = "your-tmdb-api-key"
    tmdb_base_url: str = "https://api.themoviedb.org/3"

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-5"

    allowed_origins: str = "http://localhost:5173,http://localhost:8080"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def ai_enabled(self) -> bool:
        """LLM-backed endpoints degrade gracefully to rule-based behavior without a key."""
        return bool(self.anthropic_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
