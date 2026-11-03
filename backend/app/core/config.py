from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Godavari SmartMap 2027 API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = (
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,"
        "http://192.168.0.109:5173,http://192.168.0.108:5173,http://192.168.0.106:5173,"
        "https://godavari-smartmap-2027.onrender.com"
    )
    
    JWT_SECRET: str = "dev-insecure-secret-key-godavari-smartmap-2027-v2"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    
    ADMIN_SECRET_KEY: str = "pushkaralu-control-room-secure-key-2027"
    DATABASE_URL: str = "sqlite:///./godavari_smartmap_v2.db"
    DB_PATH: str = "godavari_smartmap_v2.db"
    
    SMS_PROVIDER: str = "simulation"
    SMS_API_KEY: str = ""
    SMS_SENDER_ID: str = "GDVMP"

    WHATSAPP_PROVIDER: str = "simulation"
    WHATSAPP_API_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_ANNOUNCEMENT_BOOTH_PHONE: str = "+919182915631"

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip().rstrip("/") for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return [i.strip().rstrip("/") for i in v if isinstance(i, str) and i.strip()]
        return v

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
