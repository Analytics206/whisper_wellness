import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional } from 'class-validator';
import { CreateChatMessageDto } from './create-chat-message.dto';

export class UpdateChatMessageDto extends PartialType(CreateChatMessageDto) {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;
}
