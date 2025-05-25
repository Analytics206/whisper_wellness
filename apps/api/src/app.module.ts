import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '@users/users.module';
import { JournalModule } from '@journal/journal.module';
import { DatabaseModule } from '@database/database.module';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/whisper_wellness'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    JournalModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
