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

  @Delete('article/:article_id')
  @ApiOperation({ summary: 'Remove reaction from article' })
  @ApiParam({ name: 'article_id', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Reaction removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Reaction not found',
  })
  async removeArticleReaction(
    @Param('article_id') article_id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    return this.reactionsService.removeReaction(user.id, +article_id);
  }

  @Delete('project/:project_id')
  @ApiOperation({ summary: 'Remove reaction from project' })
  @ApiParam({ name: 'project_id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Reaction removed successfully',
  })
  async removeProjectReaction(
    @Param('project_id') project_id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    return this.reactionsService.removeReaction(
      user.id,
      undefined,
      +project_id,
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
    @Param('challengeId') challenge_id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    return this.reactionsService.removeReaction(
      user.id,
      undefined,
      undefined,
      +challenge_id,
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
  @ApiQuery({ name: 'article_id', required: false, description: 'Article ID' })
  @ApiQuery({ name: 'project_id', required: false, description: 'Project ID' })
  @ApiQuery({ name: 'challengeId', required: false, description: 'Challenge ID' })
  @ApiQuery({ name: 'cafePostId', required: false, description: 'Cafe Post ID' })
  @ApiResponse({
    status: 200,
    description: 'Reaction statistics',
    type: ReactionStatsDto,
  })
  async getReactionStats(
    @Query('article_id') article_id?: string,
    @Query('project_id') project_id?: string,
    @Query('challengeId') challengeId?: string,
    @Query('cafePostId') cafePostId?: string,
    @CurrentUser() user?: User,
  ): Promise<ReactionStatsDto> {
    return this.reactionsService.getReactionStats(
      article_id ? +article_id : undefined,
      project_id ? +project_id : undefined,
      challengeId ? +challengeId : undefined,
      cafePostId ? +cafePostId : undefined,
      user?.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get reactions for content' })
  @ApiQuery({ name: 'article_id', required: false, description: 'Article ID' })
  @ApiQuery({ name: 'project_id', required: false, description: 'Project ID' })
  @ApiQuery({ name: 'challengeId', required: false, description: 'Challenge ID' })
  @ApiQuery({ name: 'cafePostId', required: false, description: 'Cafe Post ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'List of reactions',
  })
  async getContentReactions(
    @Query('article_id') article_id?: string,
    @Query('project_id') project_id?: string,
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
      article_id ? +article_id : undefined,
      project_id ? +project_id : undefined,
      challengeId ? +challengeId : undefined,
      cafePostId ? +cafePostId : undefined,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }
}
