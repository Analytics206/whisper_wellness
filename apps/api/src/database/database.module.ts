import { Global, Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDbService } from './mongodb.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { JournalEntry, JournalEntrySchema } from '../journal/schemas/journal-entry.schema';
import { ChatMessage, ChatMessageSchema } from '../chat/schemas/chat-message.schema';

@Global()
@Module({
  imports: [
    ConfigModule,
    
    // MongoDB connection with configuration
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('MongoDB');
        const uri = `mongodb://${configService.get('MONGODB_USERNAME')}:${encodeURIComponent(configService.get('MONGODB_PASSWORD'))}@${configService.get('MONGODB_HOST')}:${configService.get('MONGODB_PORT')}/${configService.get('MONGODB_DATABASE')}?authSource=${configService.get('MONGODB_AUTH_SOURCE')}`;
        
        logger.log(`Connecting to MongoDB at ${configService.get('MONGODB_HOST')}:${configService.get('MONGODB_PORT')}/${configService.get('MONGODB_DATABASE')}`);
        
        return {
          uri,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 30000,
          directConnection: true,
          ssl: false,
          tls: false,
          connectionFactory: (connection) => {
            if (connection.readyState === 1) {
              logger.log('MongoDB connected successfully');
            }
            connection.on('error', (error) => {
              logger.error('MongoDB connection error:', error);
            });
            return connection;
          },
        };
      },
    }),

    // MongoDB models
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: JournalEntry.name, schema: JournalEntrySchema },
      { name: ChatMessage.name, schema: ChatMessageSchema }
    ]),
  ],
  providers: [
    MongoDbService,
  ],
  exports: [MongoDbService],
})
export class DatabaseModule {}
