import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateChatMessageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
