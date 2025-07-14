import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateForumDto, UpdateForumDto, ForumFilterDto } from './dto/forum.dto';

@Injectable()
export class ForumService {
  constructor(private prisma: PrismaService) {}

  async createForum(userId: number, createForumDto: CreateForumDto) {
    const slug = this.generateSlug(createForumDto.title);

    return await this.prisma.forum.create({
      data: {
        title: createForumDto.title,
        description: createForumDto.description,
        icon: createForumDto.icon,
        color: createForumDto.color,
        isPublic: createForumDto.isPublic ?? true,
        rules: createForumDto.rules,
        tags: createForumDto.tags ?? [],
        slug,
        creatorId: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
            topics: true,
          },
        },
      },
    });
  }

  async getForums(filterDto: ForumFilterDto) {
    const { page = 1, limit = 10, search, isPublic } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    const [forums, total] = await Promise.all([
      this.prisma.forum.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              members: true,
              topics: true,
            },
          },
        },
      }),
      this.prisma.forum.count({ where }),
    ]);

    return {
      forums,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getForumById(id: number) {
    const forum = await this.prisma.forum.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
            topics: true,
          },
        },
      },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    return forum;
  }

  async getForumBySlug(slug: string) {
    const forum = await this.prisma.forum.findUnique({
      where: { slug },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
            topics: true,
          },
        },
      },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    return forum;
  }

  async updateForum(id: number, userId: number, updateForumDto: UpdateForumDto) {
    const forum = await this.prisma.forum.findUnique({
      where: { id },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    if (forum.creatorId !== userId) {
      throw new ForbiddenException('Only forum creator can update this forum');
    }

    const updateData: any = {};
    
    if (updateForumDto.title !== undefined) {
      updateData.title = updateForumDto.title;
      updateData.slug = this.generateSlug(updateForumDto.title);
    }
    if (updateForumDto.description !== undefined) updateData.description = updateForumDto.description;
    if (updateForumDto.icon !== undefined) updateData.icon = updateForumDto.icon;
    if (updateForumDto.color !== undefined) updateData.color = updateForumDto.color;
    if (updateForumDto.isPublic !== undefined) updateData.isPublic = updateForumDto.isPublic;
    if (updateForumDto.rules !== undefined) updateData.rules = updateForumDto.rules;
    if (updateForumDto.tags !== undefined) updateData.tags = updateForumDto.tags;

    return await this.prisma.forum.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
            topics: true,
          },
        },
      },
    });
  }

  async deleteForum(id: number, userId: number) {
    const forum = await this.prisma.forum.findUnique({
      where: { id },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    if (forum.creatorId !== userId) {
      throw new ForbiddenException('Only forum creator can delete this forum');
    }

    await this.prisma.forum.delete({
      where: { id },
    });

    return { message: 'Forum deleted successfully' };
  }

  async joinForum(forumId: number, userId: number) {
    const forum = await this.prisma.forum.findUnique({
      where: { id: forumId },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    const existingMember = await this.prisma.forumMember.findUnique({
      where: {
        userId_forumId: {
          userId,
          forumId,
        },
      },
    });

    if (existingMember) {
      throw new ForbiddenException('User is already a member of this forum');
    }

    return await this.prisma.forumMember.create({
      data: {
        forumId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async leaveForum(forumId: number, userId: number) {
    const member = await this.prisma.forumMember.findUnique({
      where: {
        userId_forumId: {
          userId,
          forumId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('User is not a member of this forum');
    }

    await this.prisma.forumMember.delete({
      where: {
        userId_forumId: {
          userId,
          forumId,
        },
      },
    });

    return { message: 'Successfully left the forum' };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
