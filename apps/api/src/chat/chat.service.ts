import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from '@chat/schemas/chat-message.schema';
import { CreateChatMessageDto } from '@chat/dto/create-chat-message.dto';
import { UpdateChatMessageDto } from '@chat/dto/update-chat-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name) 
    private chatMessageModel: Model<ChatMessageDocument>,
  ) {}

  async create(createChatMessageDto: CreateChatMessageDto, userId: Types.ObjectId): Promise<ChatMessage> {
    const createdMessage = new this.chatMessageModel({
      ...createChatMessageDto,
      user: userId,
    });
    return createdMessage.save();
  }

  async findAll(userId: Types.ObjectId, limit = 10, offset = 0): Promise<{ items: ChatMessage[]; total: number }> {
    const [items, total] = await Promise.all([
      this.chatMessageModel
        .find({ user: userId, deletedAt: null })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec(),
      this.chatMessageModel.countDocuments({ user: userId, deletedAt: null }),
    ]);

    return { items, total };
  }

  async findOne(id: string, userId: Types.ObjectId): Promise<ChatMessage> {
    const message = await this.chatMessageModel.findOne({
      _id: id,
      user: userId,
      deletedAt: null,
    }).exec();

    if (!message) {
      throw new NotFoundException(`Chat message with ID ${id} not found`);
    }

    return message;
  }

  async update(
    id: string,
    updateChatMessageDto: UpdateChatMessageDto,
    userId: Types.ObjectId,
  ): Promise<ChatMessage> {
    const message = await this.chatMessageModel.findOneAndUpdate(
      { _id: id, user: userId, deletedAt: null },
      { $set: updateChatMessageDto },
      { new: true },
    ).exec();

    if (!message) {
      throw new NotFoundException(`Chat message with ID ${id} not found`);
    }

    return message;
  }

  async remove(id: string, userId: Types.ObjectId): Promise<ChatMessage> {
    const message = await this.chatMessageModel.findOneAndUpdate(
      { _id: id, user: userId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true },
    ).exec();

    if (!message) {
      throw new NotFoundException(`Chat message with ID ${id} not found`);
    }

    return message;
  }

  async search(userId: Types.ObjectId, query: string, limit = 10): Promise<ChatMessage[]> {
    return this.chatMessageModel.find({
      user: userId,
      deletedAt: null,
      $text: { $search: query },
    })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .exec();
  }
}
