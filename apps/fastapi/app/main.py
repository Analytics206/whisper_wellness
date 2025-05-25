import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import settings
from app.api.v1.api import api_router
from app.db.mongodb import MongoDB
from app.db.qdrant import QdrantDB

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up FastAPI application...")
    
    try:
        # Initialize database connections
        logger.info("Connecting to MongoDB...")
        await MongoDB.connect()
        
        logger.info("Connecting to Qdrant...")
        QdrantDB.connect()
        QdrantDB.ensure_collection()
        
        logger.info("✅ All services connected successfully")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ Failed to start application: {e}")
        raise
        
    finally:
        # Cleanup
        logger.info("Shutting down FastAPI application...")
        await MongoDB.close()
        QdrantDB.close()
        logger.info("✅ All services disconnected")

app = FastAPI(
    title="Whisper Wellness LLM API",
    description="API for local LLM integration with HuggingFace/Ollama",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(api_router, prefix="/api/v1")

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        dict: Status of the API and its dependencies
    """
    try:
        # Check MongoDB connection
        await MongoDB.client.admin.command('ping')
        mongo_status = "healthy"
    except Exception as e:
        logger.error(f"MongoDB health check failed: {e}")
        mongo_status = "unhealthy"
    
    try:
        # Check Qdrant connection
        QdrantDB.client.get_collections()
        qdrant_status = "healthy"
    except Exception as e:
        logger.error(f"Qdrant health check failed: {e}")
        qdrant_status = "unhealthy"
    
    return {
        "status": "healthy",
        "services": {
            "mongodb": mongo_status,
            "qdrant": qdrant_status
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=1
    )
