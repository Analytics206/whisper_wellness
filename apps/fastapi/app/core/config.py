from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional, Union
import os
from pathlib import Path

class Settings(BaseSettings):
    # Application settings
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8002"))
    
    # CORS settings
    CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS", "*").split(",")
    
    # HuggingFace settings
    # Only required if downloading models from Hugging Face Hub
    HUGGINGFACE_HUB_TOKEN: Optional[str] = os.getenv("HUGGINGFACE_HUB_TOKEN")
    # Can be a local path or a Hugging Face model ID
    HUGGINGFACE_MODEL: str = os.getenv("HUGGINGFACE_MODEL", "meta-llama/Llama-2-7b-chat-hf")
    
    # Ollama settings
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama2")
    
    # Model settings
    MODEL_MAX_LENGTH: int = int(os.getenv("MODEL_MAX_LENGTH", "4096"))
    MODEL_TEMPERATURE: float = float(os.getenv("MODEL_TEMPERATURE", "0.7"))
    
    # Model cache directory
    MODEL_CACHE_DIR: Path = Path(os.getenv("MODEL_CACHE_DIR", "~/.cache/huggingface/hub")).expanduser()
    
    # MongoDB settings
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
    MONGODB_DB: str = os.getenv("MONGODB_DB", "whisper_wellness")
    
    # Qdrant settings
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    QDRANT_COLLECTION: str = os.getenv("QDRANT_COLLECTION", "whisper_wellness")
    
    # API settings
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Create settings instance
settings = Settings()
