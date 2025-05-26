import { NestFactory } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoDbService } from '../src/database/mongodb.service';
import { DatabaseModule } from '../src/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

async function testMongoDBConnection() {
  console.log('Testing MongoDB connection...');
  
  try {
    // For testing from host, use localhost:27018
    const dbConfig = {
      host: 'localhost',
      port: '27018', // Host-mapped port
      database: getRequiredEnv('MONGODB_DATABASE'),
      authSource: getRequiredEnv('MONGODB_AUTH_SOURCE'),
      username: getRequiredEnv('MONGODB_USERNAME'),
      password: getRequiredEnv('MONGODB_PASSWORD'),
    };
    
    console.log('Using MongoDB Configuration:', {
      ...dbConfig,
      password: '***', // Don't log the actual password
    });

    console.log('MongoDB Configuration:', {
      ...dbConfig,
      password: '***', // Don't log the actual password
    });
    // Create a temporary app context with ConfigModule
    const app = await NestFactory.createApplicationContext({
      module: DatabaseModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env', '.env.development'],
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: () => ({
            uri: `mongodb://${dbConfig.username}:${encodeURIComponent(dbConfig.password)}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}?authSource=${dbConfig.authSource}`,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 30000,
            directConnection: true,
            ssl: false,
            tls: false,
          }),
        }),
        DatabaseModule,
      ],
    });

    const configService = app.get(ConfigService);
    const mongoService = app.get(MongoDbService);

    // Test connection by getting database stats
    const connection: Connection = mongoService.getConnection();
    const db = connection.db;
    
    if (!db) {
      throw new Error('Failed to get database instance');
    }
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Get database stats
    const stats = await db.stats();
    console.log('Database Stats:', {
      db: stats.db,
      collections: stats.collections,
      objects: stats.objects,
      dataSize: stats.dataSize,
    });
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

testMongoDBConnection();
