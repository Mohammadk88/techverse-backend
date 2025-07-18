import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateUserDto, UpdateUserRoleDto } from './dto/user.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { UserRole } from '../common/decorators/roles.decorator';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          bio: true,
          avatar: true,
          role: true,
          xp: true,
          countryId: true,
          languageId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        avatar: true,
        role: true,
        xp: true,
        countryId: true,
        cityId: true,
        languageId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        country: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        city: {
          select: {
            id: true,
            name: true,
          },
        },
        language: {
          select: {
            id: true,
            name: true,
            nativeName: true,
            code: true,
            direction: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get follow counts
    const [followersCount, followingCount] = await Promise.all([
      this.prisma.follow.count({
        where: { followingId: id },
      }),
      this.prisma.follow.count({
        where: { followerId: id },
      }),
    ]);

    return {
      ...user,
      followersCount,
      followingCount,
    };
  }

  async findOneWithLocation(id: number) {
    return this.findOne(id);
  }

  async updateProfile(id: number, updateUserDto: UpdateUserDto) {
    // Check if username is taken by another user
    if (updateUserDto.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: updateUserDto.username },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Username is already taken');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        avatar: true,
        role: true,
        xp: true,
        countryId: true,
        languageId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateRole(
    id: number,
    updateUserRoleDto: UpdateUserRoleDto,
    currentUser: any,
  ) {
    // Only BARISTA (admin) can update roles
    if (currentUser.role !== UserRole.BARISTA) {
      throw new ForbiddenException('Only administrators can update user roles');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { role: updateUserRoleDto.role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        xp: true,
      },
    });

    return user;
  }

  async deactivateUser(id: number, currentUser: any) {
    // Only BARISTA (admin) can deactivate users, or users can deactivate themselves
    if (currentUser.role !== UserRole.BARISTA && currentUser.id !== id) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    return user;
  }

  async getLeaderboard(limit: number = 10) {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        avatar: true,
        xp: true,
      },
      orderBy: {
        xp: 'desc',
      },
      take: limit,
    });

    return users;
  }
}
