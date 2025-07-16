import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto, ReactionStatsDto, ReactionResponseDto } from './dto/reaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, User } from '../common/decorators/current-user.decorator';

@ApiTags('🎭 Reactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Add or update a reaction' })
  @ApiResponse({
    status: 201,
    description: 'Reaction added successfully',
    type: ReactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid content ID or missing required fields',
  })
  @ApiResponse({
    status: 404,
    description: 'Content not found',
  })
  @HttpCode(HttpStatus.CREATED)
  async addReaction(
    @Body() createReactionDto: CreateReactionDto,
    @CurrentUser() user: User,
  ): Promise<ReactionResponseDto> {
    return this.reactionsService.addReaction(user.id, createReactionDto);
  }

  @Delete('article/:articleId')
  @ApiOperation({ summary: 'Remove reaction from article' })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Reaction removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Reaction not found',
  })
  async removeArticleReaction(
    @Param('articleId') articleId: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    return this.reactionsService.removeReaction(user.id, +articleId);
  }

  @Delete('project/:projectId')
  @ApiOperation({ summary: 'Remove reaction from project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Reaction removed successfully',
  })
  async removeProjectReaction(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    return this.reactionsService.removeReaction(
      user.id,
      undefined,
      +projectId,
    );
  }

  @Delete('challenge/:challengeId')
  @ApiOperation({ summary: 'Remove reaction from challenge' })
  @ApiParam({ name: 'challengeId', description: 'Challenge ID' })
  @ApiResponse({
    status: 200,
    description: 'Reaction removed successfully',
  })
  async removeChallengeReaction(
    @Param('challengeId') challengeId: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    return this.reactionsService.removeReaction(
      user.id,
      undefined,
      undefined,
      +challengeId,
    );
  }

  @Delete('cafe-post/:cafePostId')
  @ApiOperation({ summary: 'Remove reaction from cafe post' })
  @ApiParam({ name: 'cafePostId', description: 'Cafe Post ID' })
  @ApiResponse({
    status: 200,
    description: 'Reaction removed successfully',
  })
  async removeCafePostReaction(
    @Param('cafePostId') cafePostId: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    return this.reactionsService.removeReaction(
      user.id,
      undefined,
      undefined,
      undefined,
      +cafePostId,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get reaction statistics for content' })
  @ApiQuery({ name: 'articleId', required: false, description: 'Article ID' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Project ID' })
  @ApiQuery({ name: 'challengeId', required: false, description: 'Challenge ID' })
  @ApiQuery({ name: 'cafePostId', required: false, description: 'Cafe Post ID' })
  @ApiResponse({
    status: 200,
    description: 'Reaction statistics',
    type: ReactionStatsDto,
  })
  async getReactionStats(
    @Query('articleId') articleId?: string,
    @Query('projectId') projectId?: string,
    @Query('challengeId') challengeId?: string,
    @Query('cafePostId') cafePostId?: string,
    @CurrentUser() user?: User,
  ): Promise<ReactionStatsDto> {
    return this.reactionsService.getReactionStats(
      articleId ? +articleId : undefined,
      projectId ? +projectId : undefined,
      challengeId ? +challengeId : undefined,
      cafePostId ? +cafePostId : undefined,
      user?.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get reactions for content' })
  @ApiQuery({ name: 'articleId', required: false, description: 'Article ID' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Project ID' })
  @ApiQuery({ name: 'challengeId', required: false, description: 'Challenge ID' })
  @ApiQuery({ name: 'cafePostId', required: false, description: 'Cafe Post ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'List of reactions',
  })
  async getContentReactions(
    @Query('articleId') articleId?: string,
    @Query('projectId') projectId?: string,
    @Query('challengeId') challengeId?: string,
    @Query('cafePostId') cafePostId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    reactions: ReactionResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.reactionsService.getContentReactions(
      articleId ? +articleId : undefined,
      projectId ? +projectId : undefined,
      challengeId ? +challengeId : undefined,
      cafePostId ? +cafePostId : undefined,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }
}
