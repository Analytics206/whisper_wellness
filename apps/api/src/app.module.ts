import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@users/users.module';
import { JournalModule } from '@journal/journal.module';
import { DatabaseModule } from '@database/database.module';
import { AuthModule } from '@auth/auth.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development'],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    JournalModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
