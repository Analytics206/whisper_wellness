"""
MongoDB database connection and utilities.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

from app.core.config import settings

class MongoDB:
    """MongoDB connection handler."""
    
    client: AsyncIOMotorClient = None
    sync_client: MongoClient = None
    
    @classmethod
    async def connect(cls):
        """Create database connection."""
        try:
            # Get MongoDB URI from settings
            mongo_uri = settings.MONGODB_URI
            
            # Connection options for testing without SSL
            connection_kwargs = {
                'serverSelectionTimeoutMS': 5000
            }
            
            # Create async client without SSL
            cls.client = AsyncIOMotorClient(mongo_uri, **connection_kwargs)
            
            # Test the connection
            await cls.client.admin.command('ping')
            print("✅ Connected to MongoDB")
            
            # Also create a sync client for operations that need it
            cls.sync_client = MongoClient(mongo_uri, **connection_kwargs)
            
            # Test sync connection
            cls.sync_client.admin.command('ping')
            
        except ConnectionFailure as e:
            print(f"❌ MongoDB connection error: {e}")
            raise
    
    @classmethod
    async def close(cls):
        """Close database connection."""
        if cls.client:
            cls.client.close()
            print("✅ MongoDB connection closed")
        if cls.sync_client:
            cls.sync_client.close()
    
    @classmethod
    def get_database(cls):
        """Get database instance."""
        if not cls.client:
            raise RuntimeError("MongoDB client not initialized")
        return cls.client[settings.MONGODB_DB]
    
    @classmethod
    def get_collection(cls, collection_name: str):
        """Get a collection from the database."""
        return cls.get_database()[collection_name]
    
    @classmethod
    def get_sync_database(cls):
        """Get sync database instance."""
        if not cls.sync_client:
            raise RuntimeError("MongoDB sync client not initialized")
        return cls.sync_client[settings.MONGODB_DB]
    
    @classmethod
    def get_sync_collection(cls, collection_name: str):
        """Get a collection from the sync database."""
        return cls.get_sync_database()[collection_name]
