import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FollowService } from './follow.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser, User } from '../common/decorators/current-user.decorator';

@ApiTags('Follow')
@ApiBearerAuth()
@Controller('users')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(':id/follow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully followed user',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        follow: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            follower_id: { type: 'number' },
            following_id: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' },
            users_follows_following_idTousers: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                username: { type: 'string' },
                first_name: { type: 'string' },
                last_name: { type: 'string' },
                avatar: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Cannot follow yourself' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Already following this user' })
  async followUser(
    @Param('id', ParseIntPipe) following_id: number,
    @CurrentUser() user: User,
  ) {
    return this.followService.followUser(user.id, following_id);
  }

  @Delete(':id/unfollow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully unfollowed user',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Cannot unfollow yourself' })
  @ApiResponse({ status: 404, description: 'Not following this user' })
  async unfollowUser(
    @Param('id', ParseIntPipe) following_id: number,
    @CurrentUser() user: User,
  ) {
    return this.followService.unfollowUser(user.id, following_id);
  }

  @Get(':id/followers')
  @ApiOperation({ summary: 'Get followers of a user' })
  @ApiResponse({
    status: 200,
    description: 'List of followers',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              username: { type: 'string' },
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              avatar: { type: 'string' },
              bio: { type: 'string' },
              xp: { type: 'number' },
              followedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getFollowers(
    @Param('id', ParseIntPipe) user_id: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.followService.getFollowers(user_id, paginationDto);
  }

  @Get(':id/following')
  @ApiOperation({ summary: 'Get users that a user is following' })
  @ApiResponse({
    status: 200,
    description: 'List of users being followed',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              username: { type: 'string' },
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              avatar: { type: 'string' },
              bio: { type: 'string' },
              xp: { type: 'number' },
              followedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getFollowing(
    @Param('id', ParseIntPipe) user_id: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.followService.getFollowing(user_id, paginationDto);
  }

  @Get(':id/follow-counts')
  @ApiOperation({ summary: 'Get follower and following counts for a user' })
  @ApiResponse({
    status: 200,
    description: 'Follow counts',
    schema: {
      type: 'object',
      properties: {
        followersCount: { type: 'number' },
        followingCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getFollowCounts(@Param('id', ParseIntPipe) user_id: number) {
    return this.followService.getFollowStats(user_id);
  }

  @Get(':id/follow-status')
  @ApiOperation({
    summary: 'Get follow status between current user and target user',
  })
  @ApiResponse({
    status: 200,
    description: 'Follow status',
    schema: {
      type: 'object',
      properties: {
        isFollowing: { type: 'boolean' },
        isFollowedBy: { type: 'boolean' },
        isSelf: { type: 'boolean' },
      },
    },
  })
  async getFollowStatus(
    @Param('id', ParseIntPipe) targetUserId: number,
    @CurrentUser() user: User,
  ) {
    return this.followService.isFollowing(user.id, targetUserId);
  }
}
