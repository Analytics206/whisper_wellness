import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MongoDbService {
  constructor(
    @Inject(getModelToken('User'))
    public userModel: Model<any>,
    @Inject(getModelToken('JournalEntry'))
    public journalEntryModel: Model<any>,
  ) {}

  /**
   * Get a Mongoose model by name
   * @param modelName The name of the model to retrieve
   */
  getModel<T>(modelName: string): Model<T> {
    switch (modelName.toLowerCase()) {
      case 'user':
        return this.userModel as Model<T>;
      case 'journalentry':
        return this.journalEntryModel as Model<T>;
      default:
        throw new Error(`Model ${modelName} not found`);
    }
  }
}
