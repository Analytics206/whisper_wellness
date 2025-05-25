import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService implements OnModuleInit {
  private client: QdrantClient;
  private readonly defaultCollection = 'whisper_wellness';

  constructor(
    @Inject('QDRANT_CLIENT') private readonly config: { url: string; apiKey?: string },
  ) {
    this.client = new QdrantClient({
      url: config.url,
      apiKey: config.apiKey,
    });
  }

  async onModuleInit() {
    try {
      await this.client.getCollections();
      console.log('Successfully connected to Qdrant');
    } catch (error) {
      console.error('Failed to connect to Qdrant:', error);
      throw error;
    }
  }

  getClient(): QdrantClient {
    return this.client;
  }

  async getOrCreateCollection(collectionName: string = this.defaultCollection, vectorSize = 768) {
    try {
      const collection = await this.client.getCollection(collectionName);
      return collection;
    } catch (error) {
      if (error.status === 404) {
        console.log(`Creating new collection: ${collectionName}`);
        return this.client.createCollection(collectionName, {
          vectors: {
            size: vectorSize,
            distance: 'Cosine',
          },
        });
      }
      throw error;
    }
  }

  async upsertVectors(
    collectionName: string,
    points: Array<{
      id: string | number;
      vector: number[];
      payload?: Record<string, any>;
    }>,
  ) {
    await this.getOrCreateCollection(collectionName);
    return this.client.upsert(collectionName, {
      wait: true,
      points: points.map((point) => ({
        id: point.id,
        vector: point.vector,
        payload: point.payload || {},
      })),
    });
  }

  async searchVectors(
    collectionName: string,
    vector: number[],
    limit = 10,
    filter?: any,
  ) {
    return this.client.search(collectionName, {
      vector,
      limit,
      filter,
    });
  }
}
