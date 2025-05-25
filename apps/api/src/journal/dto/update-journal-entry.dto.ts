import { PartialType } from '@nestjs/swagger';
import { CreateJournalEntryDto } from './create-journal-entry.dto';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { JournalEntryMood } from '../schemas/journal-entry.schema';

export class UpdateJournalEntryDto extends PartialType(CreateJournalEntryDto) {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsEnum(JournalEntryMood)
  @IsOptional()
  mood?: JournalEntryMood;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  isPrivate?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sharedWith?: string[];
}
