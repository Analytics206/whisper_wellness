import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { JournalEntry, JournalEntryDocument } from './schemas/journal-entry.schema';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { QdrantService } from '../database/qdrant.service';
import { MongoDbService } from '../database/mongodb.service';

@Injectable()
export class JournalService {
  private readonly QDRANT_COLLECTION = 'journal_entries';
  private journalEntryModel;

  constructor(
    private mongoDbService: MongoDbService,
    @Inject(QdrantService)
    private qdrantService: QdrantService,
  ) {
    this.journalEntryModel = this.mongoDbService.getModel('JournalEntry');
  }

  async create(
    createJournalEntryDto: CreateJournalEntryDto,
    user: UserDocument,
  ): Promise<JournalEntryDocument> {
    const createdEntry = new this.journalEntryModel({
      ...createJournalEntryDto,
      user: user._id,
      createdBy: user._id,
      updatedBy: user._id,
    });

    const savedEntry = await createdEntry.save();
    
    // Index in Qdrant for semantic search
    await this.indexEntryInQdrant(savedEntry);
    
    return savedEntry;
  }

  async findAll(
    user: UserDocument,
    filters: {
      search?: string;
      tags?: string[];
      mood?: string;
      isPrivate?: boolean;
    } = {},
    pagination: { page?: number; limit?: number } = {},
  ): Promise<{ data: JournalEntryDocument[]; total: number }> {
    const { search, tags, mood, isPrivate } = filters;
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const query: any = {
      $or: [
        { user: user._id },
        { sharedWith: user._id },
      ],
    };

    if (search) {
      query.$text = { $search: search };
    }

    if (tags && tags.length > 0) {
      query.tags = { $all: tags };
    }

    if (mood) {
      query.mood = mood;
    }

    if (isPrivate !== undefined) {
      query.isPrivate = isPrivate;
    }

    const [data, total] = await Promise.all([
      this.journalEntryModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'firstName lastName email')
        .populate('sharedWith', 'firstName lastName email')
        .exec(),
      this.journalEntryModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async findOne(id: string, user: UserDocument): Promise<JournalEntryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Journal entry not found');
    }

    const entry = await this.journalEntryModel
      .findOne({
        _id: id,
        $or: [
          { user: user._id },
          { sharedWith: user._id },
          { isPrivate: false },
        ],
      })
      .populate('user', 'firstName lastName email')
      .populate('sharedWith', 'firstName lastName email')
      .exec();

    if (!entry) {
      throw new NotFoundException('Journal entry not found or access denied');
    }

    return entry;
  }

  async update(
    id: string,
    updateJournalEntryDto: UpdateJournalEntryDto,
    user: UserDocument,
  ): Promise<JournalEntryDocument> {
    const entry = await this.journalEntryModel.findById(id);

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    // Check if user is the owner or admin
    const isOwner = entry.user instanceof Types.ObjectId 
      ? entry.user.equals(user._id)
      : entry.user._id.equals(user._id);
      
    if (!isOwner && !user.roles.includes('admin')) {
      throw new ForbiddenException(
        'You do not have permission to update this entry',
      );
    }

    const updatedEntry = await this.journalEntryModel
      .findByIdAndUpdate(
        id,
        {
          ...updateJournalEntryDto,
          updatedBy: user._id,
        },
        { new: true },
      )
      .populate('user', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    // Update in Qdrant if content, title, or tags changed
    if (
      updateJournalEntryDto.content ||
      updateJournalEntryDto.title ||
      updateJournalEntryDto.tags
    ) {
      await this.indexEntryInQdrant(updatedEntry);
    }

    return updatedEntry;
  }

  async remove(id: string, user: UserDocument): Promise<JournalEntryDocument> {
    const entry = await this.journalEntryModel.findById(id);

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    // Check if user is the owner or admin
    const isOwner = entry.user.equals(user._id);
    if (!isOwner && !user.roles.includes('admin')) {
      throw new ForbiddenException('Not authorized to delete this entry');
    }

    // Remove from Qdrant
    await this.qdrantService.getClient().delete(this.QDRANT_COLLECTION, {
      points: [id]
    });

    return this.journalEntryModel.findByIdAndDelete(id).exec();
  }

  async searchSemantically(query: string, userId: Types.ObjectId | string, limit = 10): Promise<JournalEntryDocument[]> {
    try {
      const userIdStr = userId instanceof Types.ObjectId ? userId.toString() : userId;
      
      // Generate embedding for the search query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Search in Qdrant
      const searchResults = await this.qdrantService.searchVectors(
        this.QDRANT_COLLECTION,
        queryEmbedding,
        limit,
        {
          must: [
            {
              key: 'user_id',
              match: {
                value: userIdStr,
              },
            },
          ],
        },
      );

      if (!searchResults || searchResults.length === 0) {
        return [];
      }

      // Extract entry IDs from search results
      const entryIds = searchResults.map(result => new Types.ObjectId(result.id));
      
      // Fetch full entries from MongoDB
      return this.journalEntryModel
        .find({
          _id: { $in: entryIds },
          $or: [
            { user: new Types.ObjectId(userId) },
            { sharedWith: new Types.ObjectId(userId) },
            { isPrivate: false }
          ],
        })
        .populate('user', 'firstName lastName email')
        .populate('sharedWith', 'firstName lastName email')
        .exec();
    } catch (error) {
      console.error('Error in semantic search:', error);
      throw new Error('Failed to perform semantic search');
    }
  }

  private async indexEntryInQdrant(entry: JournalEntryDocument) {
    try {
      const text = `${entry.title} ${entry.content} ${entry.tags?.join(' ') || ''}`;
      const embedding = await this.generateEmbedding(text);
      const userId = entry.user instanceof Types.ObjectId ? entry.user.toString() : entry.user._id.toString();

      await this.qdrantService.upsertVectors(this.QDRANT_COLLECTION, [
        {
          id: entry._id.toString(),
          vector: embedding,
          payload: {
            user_id: userId,
            title: entry.title,
            content: entry.content,
            tags: entry.tags || [],
            mood: entry.mood,
            created_at: entry.createdAt.toISOString(),
          },
        },
      ]);
    } catch (error) {
      console.error('Error indexing entry in Qdrant:', error);
      throw error;
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // In a real implementation, you would use a model like OpenAI's text-embedding-ada-002
    // or a local model to generate embeddings.
    // This is a simplified implementation that returns a deterministic vector
    // based on the input text.
    const hash = this.hashCode(text);
    const embedding = new Array(768).fill(0);
    for (let i = 0; i < 10; i++) {
      embedding[(hash + i) % 768] = (hash % 100) / 100;
    }
    return embedding;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
