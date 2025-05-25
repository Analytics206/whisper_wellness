import { Module } from '@nestjs/common';
import { JournalService } from './journal.service';
import { JournalController } from './journal.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [JournalController],
  providers: [JournalService],
  exports: [JournalService],
})
export class JournalModule {}
