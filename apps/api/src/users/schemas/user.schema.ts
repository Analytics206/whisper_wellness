import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type UserDocument = User & Document & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ type: Date, default: null })
  lastLogin: Date;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  @Prop({ type: Object })
  preferences: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  createdBy: Types.ObjectId | User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  updatedBy: Types.ObjectId | User;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });
