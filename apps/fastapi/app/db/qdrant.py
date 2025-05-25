"""
Qdrant vector database connection and utilities.
"""
from typing import List, Optional, Tuple, Dict, Any

import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import Distance, VectorParams

from app.core.config import settings

class QdrantDB:
    """Qdrant vector database handler."""
    
    client: QdrantClient = None
    
    @classmethod
    def connect(cls):
        """Initialize Qdrant client."""
        try:
            cls.client = QdrantClient(
                url=settings.QDRANT_URL,
                prefer_grpc=False,
                timeout=10.0
            )
            # Test the connection
            cls.client.get_collections()
            print("✅ Connected to Qdrant")
            return cls.client
        except Exception as e:
            print(f"❌ Qdrant connection error: {e}")
            raise
    
    @classmethod
    def ensure_collection(
        cls,
        collection_name: str = None,
        vector_size: int = 768,
        distance: Distance = Distance.COSINE,
        **collection_params: Dict[str, Any]
    ) -> bool:
        """
        Ensure a collection exists, create if it doesn't.
        
        Args:
            collection_name: Name of the collection
            vector_size: Size of the vector embeddings
            distance: Distance metric for vector search
            **collection_params: Additional collection parameters
            
        Returns:
            bool: True if collection was created, False if it already exists
            
        Raises:
            Exception: If there's an error creating the collection
        """
        if not cls.client:
            cls.connect()
            
        collection_name = collection_name or settings.QDRANT_COLLECTION
        
        try:
            collections = cls.client.get_collections()
            collection_names = [collection.name for collection in collections.collections]
            
            if collection_name not in collection_names:
                cls.client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(
                        size=vector_size,
                        distance=distance,
                    ),
                    **collection_params
                )
                print(f"✅ Created Qdrant collection: {collection_name}")
                return True
            return False
        except Exception as e:
            print(f"❌ Error ensuring Qdrant collection: {e}")
            raise
    
    @classmethod
    def get_collection_info(
        cls, 
        collection_name: str = None
    ) -> models.CollectionInfo:
        
        """
        Get information about a collection.
        
        Args:
            collection_name: Name of the collection
            
        Returns:
            CollectionInfo: Information about the collection
        """
        if not cls.client:
            cls.connect()
            
        collection_name = collection_name or settings.QDRANT_COLLECTION
        return cls.client.get_collection(collection_name)
    
    @classmethod
    def close(cls):
        """Close the Qdrant client connection."""
        if cls.client:
            cls.client.close()
            print("✅ Qdrant connection closed")
