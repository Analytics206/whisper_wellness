#!/usr/bin/env python3
"""
Script to verify database connections for the FastAPI application.
This script checks the connection to MongoDB and Qdrant.
"""
import asyncio
import os
import sys
from pathlib import Path

# Add the project root to the Python path
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.core.config import settings
from app.db.mongodb import MongoDB
from app.db.qdrant import QdrantDB
from loguru import logger

# Configure logger
logger.remove()
logger.add(
    sys.stderr,
    format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
)

async def check_mongodb_connection():
    """Check MongoDB connection and basic operations."""
    try:
        logger.info("Connecting to MongoDB...")
        await MongoDB.connect()
        
        # Check if we can perform a basic operation
        db = MongoDB.get_database()
        collections = await db.list_collection_names()
        
        logger.success(f"Successfully connected to MongoDB. Available collections: {collections}")
        return True
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        return False
    finally:
        await MongoDB.close()

async def check_qdrant_connection():
    """Check Qdrant connection and basic operations."""
    try:
        logger.info("Connecting to Qdrant...")
        await QdrantDB.initialize()
        
        # Check if we can perform a basic operation
        collections = await QdrantDB.client.get_collections()
        collection_names = [collection.name for collection in collections.collections]
        
        logger.success(f"Successfully connected to Qdrant. Available collections: {collection_names}")
        return True
    except Exception as e:
        logger.error(f"Failed to connect to Qdrant: {str(e)}")
        return False

async def main():
    """Main function to check all database connections."""
    logger.info("Starting database connection checks...")
    
    # Check MongoDB connection
    mongo_success = await check_mongodb_connection()
    
    # Check Qdrant connection
    qdrant_success = await check_qdrant_connection()
    
    # Print summary
    logger.info("\n=== Connection Check Summary ===")
    logger.info(f"MongoDB: {'✓' if mongo_success else '✗'}")
    logger.info(f"Qdrant: {'✓' if qdrant_success else '✗'}")
    
    # Exit with appropriate status code
    sys.exit(0 if (mongo_success and qdrant_success) else 1)

if __name__ == "__main__":
    asyncio.run(main())
