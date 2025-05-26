import { Injectable, OnModuleInit, OnModuleDestroy, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Model, connect, Connection, createConnection, connection } from 'mongoose';

@Injectable()
export class MongoDbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongoDbService.name);
  private connection: Connection;

  constructor(
    private readonly configService: ConfigService,
    @Inject(getModelToken('User'))
    public userModel: Model<any>,
    @Inject(getModelToken('JournalEntry'))
    public journalEntryModel: Model<any>,
  ) {}

  async onModuleInit() {
    await this.connectToDatabase();
  }

  async onModuleDestroy() {
    if (this.connection) {
      await this.connection.close();
      this.logger.log('MongoDB connection closed');
    }
  }

  private getRequiredEnv(key: string): string {
    const value = this.configService.get(key);
    if (value === undefined || value === '') {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value.toString();
  }

  private async connectToDatabase() {
    try {
      // Determine if we're running in Docker or locally
      const isDocker = process.env.NODE_ENV === 'production' || process.env.DOCKER_ENV === 'true';
      
      const dbConfig = {
        // Use container name in Docker, localhost otherwise
        host: isDocker ? 'whisper-wellness-mongodb' : 'localhost',
        // Use internal port in Docker, mapped port on host
        port: isDocker ? '27017' : '27018',
        database: this.getRequiredEnv('MONGODB_DATABASE'),
        authSource: this.getRequiredEnv('MONGODB_AUTH_SOURCE'),
        username: this.getRequiredEnv('MONGODB_USERNAME'),
        password: this.getRequiredEnv('MONGODB_PASSWORD'),
      };
      
      this.logger.log(`Connecting to MongoDB at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database} (${isDocker ? 'Docker' : 'Local'})`);

      const connectionUri = `mongodb://${dbConfig.username}:${encodeURIComponent(dbConfig.password)}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}?authSource=${dbConfig.authSource}&directConnection=true`;
      
      // Use the default Mongoose connection
      await connect(connectionUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 30000,
        directConnection: true,
      });

      this.connection = connection;
      this.logger.log('Successfully connected to MongoDB');
      
      // Get database stats using Mongoose connection
      const db = this.connection.db;
      if (db) {
        try {
          const dbStats = await db.stats();
          this.logger.debug(`Database stats: ${JSON.stringify({
            db: dbStats.db,
            collections: dbStats.collections,
            objects: dbStats.objects,
            dataSize: dbStats.dataSize,
          })}`);
          
          // List collections
          const collections = await db.listCollections().toArray();
          this.logger.debug(`Collections: ${collections.map(c => c.name).join(', ')}`);
        } catch (statsError) {
          this.logger.warn(`Could not get database stats: ${statsError.message}`);
        }
      }
      
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB', error);
      throw error;
    }
  }

  /**
   * Get a Mongoose model by name
   * @param modelName The name of the model to retrieve
   */
  getModel<T>(modelName: string): Model<T> {
    if (!this.connection) {
      throw new Error('MongoDB connection not established');
    }
    
    switch (modelName.toLowerCase()) {
      case 'user':
        return this.userModel as Model<T>;
      case 'journalentry':
        return this.journalEntryModel as Model<T>;
      default:
        throw new Error(`Model ${modelName} not found`);
    }
  }

  /**
   * Get the raw MongoDB connection
   */
  getConnection(): Connection {
    if (!this.connection) {
      throw new Error('MongoDB connection not established');
    }
    return this.connection;
  }
}
