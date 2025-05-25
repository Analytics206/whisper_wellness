import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const createdUser = new this.userModel(createUserDto);
      const savedUser = await createdUser.save();
      // Convert to plain object and remove password
      const userObj = savedUser.toObject();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = userObj as any;
      return result as User;
    } catch (error) {
      if (error.code === 11000) { // Duplicate key error
        throw new Error('Email already in use');
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').lean().exec();
  }

  async findById(id: string | Types.ObjectId): Promise<User> {
    const userId = typeof id === 'string' ? new Types.ObjectId(id) : id;
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .lean()
      .exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).select('-password').lean().exec();
    return user as User | null;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).lean().exec();
    return user as User | null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .lean()
      .exec();
    
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser as User;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel
      .findByIdAndDelete(id)
      .select('-password')
      .lean()
      .exec();
      
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return deletedUser as User;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { lastLogin: new Date() })
      .exec();
  }
}
