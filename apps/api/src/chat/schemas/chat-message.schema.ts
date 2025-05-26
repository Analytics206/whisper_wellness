import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type ChatMessageDocument = ChatMessage & Document & {
  _id: Types.ObjectId;
  user: Types.ObjectId | User;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// Indexes
ChatMessageSchema.index({ user: 1 });
ChatMessageSchema.index({ createdAt: -1 });
ChatMessageSchema.index({ title: 'text', content: 'text' });
