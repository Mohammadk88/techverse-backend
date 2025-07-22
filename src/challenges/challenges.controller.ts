import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto, JoinChallengeDto, SubmitChallengeDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('🏆 Challenges & Competitions')
@ApiBearerAuth()
@Controller('challenges')
@UseGuards(JwtAuthGuard)
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new challenge',
    description:
      'Create a programming/design challenge with TechCoin rewards. Requires TechCoin for reward pool.',
  })
  @ApiResponse({
    status: 201,
    description: 'Challenge created successfully',
    schema: {
      example: {
        id: 10,
        title: 'Code Master Challenge',
        description: 'Build a web app using React and Node.js',
        reward: 100,
        entryFee: 25,
        type: 'VOTE',
        status: 'ACTIVE',
        start_date: '2025-07-20T00:00:00Z',
        end_date: '2025-07-27T23:59:59Z',
        createdBy: {
          id: 123,
          username: 'johndoe',
          avatar: null,
        },
        participantCount: 5,
        created_at: '2025-07-16T14:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient TechCoin for reward pool',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async createChallenge(
    @Request() req: any,
    @Body() createDto: CreateChallengeDto,
  ) {
    return this.challengesService.createChallenge(req.user.id, createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all challenges',
    description:
      'Retrieve paginated list of all challenges with filtering options',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
    description: 'Filter by challenge status',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['VOTE', 'JUDGE'],
    description: 'Filter by challenge type',
  })
  @ApiResponse({
    status: 200,
    description: 'Challenges retrieved successfully',
    schema: {
      example: {
        challenges: [
          {
            id: 10,
            title: 'Code Master Challenge',
            description: 'Build a web app using React and Node.js',
            reward: 100,
            entryFee: 25,
            type: 'VOTE',
            status: 'ACTIVE',
            participantCount: 5,
            start_date: '2025-07-20T00:00:00Z',
            end_date: '2025-07-27T23:59:59Z',
            createdBy: {
              id: 123,
              username: 'johndoe',
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      },
    },
  })
  async getAllChallenges(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.challengesService.getAllChallenges(page || 1, limit || 10);
  }

  @Get('my-created')
  @ApiOperation({ summary: 'Get challenges created by current user' })
  @ApiResponse({ status: 200, description: 'User created challenges retrieved' })
  async getMyCreatedChallenges(@Request() req: any) {
    return this.challengesService.getUserCreatedChallenges(req.user.id);
  }

  @Get('my-participated')
  @ApiOperation({ summary: 'Get challenges user participated in' })
  @ApiResponse({ status: 200, description: 'User participated challenges retrieved' })
  async getMyParticipatedChallenges(@Request() req: any) {
    return this.challengesService.getUserParticipatedChallenges(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get challenge by ID' })
  @ApiResponse({ status: 200, description: 'Challenge retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  async getChallengeById(@Param('id', ParseIntPipe) id: number) {
    return this.challengesService.getChallengeById(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a challenge' })
  @ApiResponse({ status: 201, description: 'Joined challenge successfully' })
  @ApiResponse({ status: 400, description: 'Cannot join challenge' })
  async joinChallenge(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() joinDto: JoinChallengeDto,
  ) {
    return this.challengesService.joinChallenge(req.user.id, id, joinDto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit solution to challenge' })
  @ApiResponse({ status: 200, description: 'Solution submitted successfully' })
  @ApiResponse({ status: 404, description: 'Not a participant' })
  async submitSolution(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() submitDto: SubmitChallengeDto,
  ) {
    return this.challengesService.submitSolution(req.user.id, id, submitDto);
  }

  @Post(':id/vote/:participantId')
  @ApiOperation({ summary: 'Vote for a participant' })
  @ApiResponse({ status: 200, description: 'Vote recorded successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to vote' })
  async voteForParticipant(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('participantId', ParseIntPipe) participantId: number,
  ) {
    return this.challengesService.voteForParticipant(
      req.user.id,
      id,
      participantId,
    );
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close challenge and determine winner' })
  @ApiResponse({ status: 200, description: 'Challenge closed successfully' })
  @ApiResponse({ status: 403, description: 'Only creator can close challenge' })
  async closeChallenge(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.challengesService.closeChallenge(id, req.user.id);
  }
}
