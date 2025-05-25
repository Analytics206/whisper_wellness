import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';

export type JournalEntryDocument = JournalEntry & Document & {
  _id: Types.ObjectId;
  user: Types.ObjectId | UserDocument;
  createdAt: Date;
  updatedAt: Date;
};

export enum JournalEntryMood {
  VERY_GOOD = 'very_good',
  GOOD = 'good',
  NEUTRAL = 'neutral',
  BAD = 'bad',
  VERY_BAD = 'very_bad',
}

@Schema({ timestamps: true })
export class JournalEntry {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | UserDocument;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String, enum: JournalEntryMood, default: JournalEntryMood.NEUTRAL })
  mood: JournalEntryMood;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ type: Boolean, default: false })
  isPrivate: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  sharedWith: Types.ObjectId[] | UserDocument[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId | UserDocument;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId | UserDocument;
}

export const JournalEntrySchema = SchemaFactory.createForClass(JournalEntry);

// Indexes for better query performance
JournalEntrySchema.index({ user: 1, createdAt: -1 });
JournalEntrySchema.index({ tags: 1 });
JournalEntrySchema.index({ mood: 1 });
JournalEntrySchema.index({ isPrivate: 1 });
JournalEntrySchema.index({ 'content': 'text', 'title': 'text' });
