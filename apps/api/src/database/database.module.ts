import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
// Temporarily disabled Neo4j integration
// import { Neo4jModule } from 'nest-neo4j';
import { QdrantService } from './qdrant.service';
import { MongoDbService } from './mongodb.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { JournalEntry, JournalEntrySchema } from '../journal/schemas/journal-entry.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/whisper_wellness'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    // Temporarily disabled Neo4j integration
    // Neo4jModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     scheme: configService.get('NEO4J_SCHEME', 'neo4j'),
    //     host: configService.get('NEO4J_HOST', 'localhost'),
    //     port: configService.get('NEO4J_PORT', '7687'),
    //     username: configService.get('NEO4J_USERNAME', 'neo4j'),
    //     password: configService.get('NEO4J_PASSWORD', 'password'),
    //     database: configService.get('NEO4J_DATABASE', 'neo4j'),
    //   }),
    // }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: JournalEntry.name, schema: JournalEntrySchema },
    ]),
  ],
  providers: [
    {
      provide: 'QDRANT_CLIENT',
      useFactory: (configService: ConfigService) => ({
        url: configService.get('QDRANT_URL', 'http://localhost:6335'),
        apiKey: configService.get('QDRANT_API_KEY', ''),
      }),
      inject: [ConfigService],
    },
    QdrantService,
    MongoDbService,
  ],
  exports: [QdrantService, MongoDbService],
})
export class DatabaseModule {}
