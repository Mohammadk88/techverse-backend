import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class FollowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  async followUser(follower_id: number, following_id: number) {
    // Prevent self-following
    if (follower_id === following_id) {
      throw new ForbiddenException('You cannot follow yourself');
    }

    // Check if the user being followed exists
    const userToFollow = await this.prisma.users.findUnique({
      where: { id: following_id },
    });

    if (!userToFollow) {
      throw new NotFoundException('User to follow not found');
    }

    // Check if already following
    const existingFollow = await this.prisma.follows.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: follower_id,
          following_id: following_id,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException('You are already following this user');
    }

    // Create the follow relationship
    const follow = await this.prisma.follows.create({
      data: {
        follower_id: follower_id,
        following_id: following_id,
      },
    });

    // Award XP to both users
    try {
      // Award XP to the follower for following someone
      await this.walletService.awardXPForActivity(follower_id, 'FOLLOW_USER');
      
      // Award XP to the user being followed for gaining a follower
      await this.walletService.awardXPForActivity(following_id, 'GET_FOLLOWED');
    } catch (error) {
      console.error('Failed to award XP for follow action:', error);
      // Don't fail the follow operation if XP fails
    }

    return {
      success: true,
      message: 'User followed successfully',
      data: follow,
    };
  }

  async unfollowUser(follower_id: number, following_id: number) {
    // Prevent self-unfollowing
    if (follower_id === following_id) {
      throw new ForbiddenException('You cannot unfollow yourself');
    }

    // Check if the follow relationship exists
    const existingFollow = await this.prisma.follows.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: follower_id,
          following_id: following_id,
        },
      },
    });

    if (!existingFollow) {
      throw new NotFoundException('You are not following this user');
    }

    // Delete the follow relationship
    await this.prisma.follows.delete({
      where: {
        follower_id_following_id: {
          follower_id: follower_id,
          following_id: following_id,
        },
      },
    });

    return {
      success: true,
      message: 'User unfollowed successfully',
    };
  }

  async getFollowers(user_id: number, paginationDto: PaginationDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      this.prisma.follows.findMany({
        where: { following_id: user_id },
        skip,
        take: limit,
        include: {
          users_follows_follower_idTousers: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              avatar: true,
              bio: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.follows.count({
        where: { following_id: user_id },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: followers.map((follow) => ({
        id: follow.id,
        user: follow.users_follows_follower_idTousers,
        followed_at: follow.created_at,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getFollowing(user_id: number, paginationDto: PaginationDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      this.prisma.follows.findMany({
        where: { follower_id: user_id },
        skip,
        take: limit,
        include: {
          users_follows_following_idTousers: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              avatar: true,
              bio: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.follows.count({
        where: { follower_id: user_id },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: following.map((follow) => ({
        id: follow.id,
        user: follow.users_follows_following_idTousers,
        followed_at: follow.created_at,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getFollowStats(user_id: number) {
    const [followersCount, followingCount] = await Promise.all([
      this.prisma.follows.count({
        where: { following_id: user_id },
      }),
      this.prisma.follows.count({
        where: { follower_id: user_id },
      }),
    ]);

    return {
      followers: followersCount,
      following: followingCount,
    };
  }

  async isFollowing(follower_id: number, following_id: number): Promise<boolean> {
    const follow = await this.prisma.follows.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: follower_id,
          following_id: following_id,
        },
      },
    });

    return !!follow;
  }

  async getMutualFollows(user_id: number, other_user_id: number) {
    // Get users that both users follow
    const mutualFollows = await this.prisma.follows.findMany({
      where: {
        AND: [
          { follower_id: user_id },
          {
            following_id: {
              in: await this.prisma.follows
                .findMany({
                  where: { follower_id: other_user_id },
                  select: { following_id: true },
                })
                .then((follows) => follows.map((f) => f.following_id)),
            },
          },
        ],
      },
      include: {
        users_follows_following_idTousers: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            avatar: true,
          },
        },
      },
    });

    return mutualFollows.map((follow) => follow.users_follows_following_idTousers);
  }

  async getFollowSuggestions(user_id: number, limit: number = 5) {
    // Get users that the people you follow also follow, but you don't follow yet
    const suggestions = await this.prisma.users.findMany({
      where: {
        AND: [
          { id: { not: user_id } }, // Not the current user
          {
            // Users not already followed
            NOT: {
              follows_follows_following_idTousers: {
                some: { follower_id: user_id },
              },
            },
          },
          {
            // Users followed by people you follow
            follows_follows_following_idTousers: {
              some: {
                users_follows_follower_idTousers: {
                  follows_follows_following_idTousers: {
                    some: { follower_id: user_id },
                  },
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
        avatar: true,
        bio: true,
      },
      take: limit,
    });

    return suggestions;
  }
}
