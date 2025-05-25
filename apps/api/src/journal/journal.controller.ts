import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { Request } from 'express';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('journal')
@Controller('journal')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new journal entry' })
  @ApiResponse({ status: 201, description: 'Journal entry created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createJournalEntryDto: CreateJournalEntryDto,
    @Req() req: Request & { user: UserDocument },
  ) {
    return this.journalService.create(createJournalEntryDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all journal entries' })
  @ApiResponse({ status: 200, description: 'Return all journal entries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiQuery({ name: 'mood', required: false, type: String })
  @ApiQuery({ name: 'isPrivate', required: false, type: Boolean })
  async findAll(
    @Req() req: Request & { user: UserDocument },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Query('mood') mood?: string,
    @Query('isPrivate') isPrivate?: string,
  ) {
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const tagArray = tags ? tags.split(',') : [];
    
    return this.journalService.findAll(
      req.user,
      {
        search,
        tags: tagArray,
        mood,
        isPrivate: isPrivate ? isPrivate === 'true' : undefined,
      },
      { page, limit },
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search journal entries semantically' })
  @ApiResponse({ status: 200, description: 'Return matching journal entries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async search(
    @Query('q') query: string,
    @Req() req: Request & { user: UserDocument },
  ) {
    if (!query) {
      throw new BadRequestException('Query parameter q is required');
    }
    return this.journalService.searchSemantically(
      query,
      req.user._id,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a journal entry by ID' })
  @ApiResponse({ status: 200, description: 'Return the journal entry' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Journal entry not found' })
  async findOne(
    @Param('id') id: string,
    @Req() req: Request & { user: UserDocument },
  ) {
    return this.journalService.findOne(id, req.user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a journal entry' })
  @ApiResponse({ status: 200, description: 'Journal entry updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Journal entry not found' })
  async update(
    @Param('id') id: string,
    @Body() updateJournalEntryDto: UpdateJournalEntryDto,
    @Req() req: Request & { user: UserDocument },
  ) {
    return this.journalService.update(
      id,
      updateJournalEntryDto,
      req.user,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a journal entry' })
  @ApiResponse({ status: 200, description: 'Journal entry deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Journal entry not found' })
  async remove(
    @Param('id') id: string,
    @Req() req: Request & { user: UserDocument },
  ) {
    return this.journalService.remove(id, req.user);
  }
}
