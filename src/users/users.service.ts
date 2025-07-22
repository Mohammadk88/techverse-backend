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
import { user_roles } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          username: true,
          bio: true,
          avatar: true,
          role: true,
          xp: true,
          country_id: true,
          language_id: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: { created_at: 'desc',
        },
      }),
      this.prisma.users.count(),
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
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        username: true,
        bio: true,
        avatar: true,
        role: true,
        xp: true,
        country_id: true,
        city_id: true,
        language_id: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        countries: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        cities: {
          select: {
            id: true,
            name: true,
          },
        },
        languages: {
          select: {
            id: true,
            name: true,
            native_name: true,
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
      this.prisma.follows.count({
        where: { following_id: id },
      }),
      this.prisma.follows.count({
        where: { follower_id: id },
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
      const existingUser = await this.prisma.users.findUnique({
        where: { username: updateUserDto.username },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Username is already taken');
      }
    }

    const user = await this.prisma.users.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        username: true,
        bio: true,
        avatar: true,
        role: true,
        xp: true,
        country_id: true,
        language_id: true,
        is_active: true,
        created_at: true,
        updated_at: true,
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
    if (currentUser.role !== user_roles.BARISTA) {
      throw new ForbiddenException('Only baristas can update user roles');
    }

    const user = await this.prisma.users.update({
      where: { id },
      data: { role: updateUserRoleDto.role },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        username: true,
        role: true,
        xp: true,
      },
    });

    return user;
  }

  async deactivateUser(id: number, currentUser: any) {
    // Only BARISTA (admin) can deactivate users, or users can deactivate themselves
    if (currentUser.role !== user_roles.BARISTA && currentUser.id !== id) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.prisma.users.update({
      where: { id },
      data: { is_active: false },
      select: {
        id: true,
        email: true,
        is_active: true,
      },
    });

    return user;
  }

  async getLeaderboard(limit: number = 10) {
    const users = await this.prisma.users.findMany({
      where: { is_active: true },
      select: {
        id: true,
        first_name: true,
        last_name: true,
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
