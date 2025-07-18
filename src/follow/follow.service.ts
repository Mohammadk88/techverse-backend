import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class FollowService {
  constructor(private readonly prisma: PrismaService) {}

  async followUser(followerId: number, followingId: number) {
    // Prevent self-following
    if (followerId === followingId) {
      throw new ForbiddenException('You cannot follow yourself');
    }

    // Check if the user being followed exists
    const userToFollow = await this.prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!userToFollow) {
      throw new NotFoundException('User to follow not found');
    }

    // Check if already following
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException('You are already following this user');
    }

    // Create follow relationship
    const follow = await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return {
      message: 'Successfully followed user',
      follow,
    };
  }

  async unfollowUser(followerId: number, followingId: number) {
    // Prevent self-unfollowing
    if (followerId === followingId) {
      throw new ForbiddenException('You cannot unfollow yourself');
    }

    // Check if follow relationship exists
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      throw new NotFoundException('You are not following this user');
    }

    // Delete follow relationship
    await this.prisma.follow.delete({
      where: {
        id: existingFollow.id,
      },
    });

    return {
      message: 'Successfully unfollowed user',
    };
  }

  async getFollowers(
    userId: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [followers, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              bio: true,
              xp: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.follow.count({
        where: { followingId: userId },
      }),
    ]);

    return {
      data: followers.map((follow) => ({
        ...follow.follower,
        followedAt: follow.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFollowing(
    userId: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [following, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        include: {
          following: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              bio: true,
              xp: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    return {
      data: following.map((follow) => ({
        ...follow.following,
        followedAt: follow.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFollowCounts(userId: number) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [followersCount, followingCount] = await Promise.all([
      this.prisma.follow.count({
        where: { followingId: userId },
      }),
      this.prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    return {
      followersCount,
      followingCount,
    };
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return !!follow;
  }

  async getFollowStatus(currentUserId: number, targetUserId: number) {
    if (currentUserId === targetUserId) {
      return {
        isFollowing: false,
        isSelf: true,
      };
    }

    const isFollowing = await this.isFollowing(currentUserId, targetUserId);
    const isFollowedBy = await this.isFollowing(targetUserId, currentUserId);

    return {
      isFollowing,
      isFollowedBy,
      isSelf: false,
    };
  }
}
