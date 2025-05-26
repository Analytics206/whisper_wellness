import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ChatService } from '@chat/chat.service';
import { CreateChatMessageDto } from '@chat/dto/create-chat-message.dto';
import { UpdateChatMessageDto } from '@chat/dto/update-chat-message.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { Types } from 'mongoose';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  create(
    @Body() createChatMessageDto: CreateChatMessageDto,
    @Req() req: Request,
  ) {
    return this.chatService.create(createChatMessageDto, req.user['_id']);
  }

  @Get()
  findAll(
    @Req() req: Request,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    return this.chatService.findAll(
      new Types.ObjectId(req.user['_id']),
      +limit,
      +offset,
    );
  }

  @Get('search')
  search(
    @Req() req: Request,
    @Query('q') query: string,
    @Query('limit') limit = 10,
  ) {
    if (!query) {
      return [];
    }
    return this.chatService.search(
      new Types.ObjectId(req.user['_id']),
      query,
      +limit,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.chatService.findOne(id, req.user['_id']);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChatMessageDto: UpdateChatMessageDto,
    @Req() req: Request,
  ) {
    return this.chatService.update(id, updateChatMessageDto, req.user['_id']);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.chatService.remove(id, req.user['_id']);
  }
}
