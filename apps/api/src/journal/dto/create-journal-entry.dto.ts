import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { JournalEntryMood } from '../schemas/journal-entry.schema';
import { Type } from 'class-transformer';

export class CreateJournalEntryDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsEnum(JournalEntryMood)
  @IsOptional()
  mood?: JournalEntryMood;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPrivate?: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  sharedWith?: string[];
}
