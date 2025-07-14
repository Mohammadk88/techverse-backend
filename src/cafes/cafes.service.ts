import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCafeDto, UpdateCafeDto, CreateCafePostDto, UpdateCafePostDto, CafeFilterDto } from './dto/cafe.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';
import { ContentQueryService } from '../common/services/content-query.service';

@Injectable()
export class CafesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contentQueryService: ContentQueryService,
  ) {}

  // Cafe Management
  async create(createCafeDto: CreateCafeDto, ownerId: number) {
    // Generate slug from name
    const slug = this.generateSlug(createCafeDto.name);
    
    // Check if slug already exists
    const existingCafe = await this.prisma.cafe.findUnique({
      where: { slug },
    });

    if (existingCafe) {
      throw new BadRequestException('A cafe with this name already exists');
    }

    const cafe = await this.prisma.cafe.create({
      data: {
        ...createCafeDto,
        slug,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    // Auto-join the owner as a member
    await this.prisma.cafeMember.create({
      data: {
        cafeId: cafe.id,
        userId: ownerId,
      },
    });

    return {
      ...cafe,
      membersCount: cafe._count.members + 1, // +1 for the owner
      postsCount: cafe._count.posts,
    };
  }

  async findAll(paginationDto: PaginationDto, filterDto?: Omit<CafeFilterDto, keyof PaginationDto>) {
    const { page = 1, limit = 10 } = paginationDto;
    const { 
      search, 
      isPrivate, 
      ownerId, 
      popular,
      languageCode,
      countryCode
    } = filterDto || {};
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (isPrivate !== undefined) where.isPrivate = isPrivate;
    if (ownerId) where.ownerId = ownerId;

    // Add localization filtering
    if (languageCode || countryCode) {
      const localizedWhere = this.contentQueryService.createLocalizedWhereClause({
        languageCode,
        countryCode,
      });
      Object.assign(where, localizedWhere);
    }

    // Handle popular cafes (example: cafes with more members)
    let orderBy: any = { createdAt: 'desc' };
    if (popular) {
      orderBy = {
        members: {
          _count: 'desc',
        },
      };
    }

    const [cafes, total] = await Promise.all([
      this.prisma.cafe.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              posts: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.cafe.count({ where }),
    ]);

    const transformedCafes = cafes.map((cafe) => ({
      ...cafe,
      membersCount: cafe._count.members,
      postsCount: cafe._count.posts,
    }));

    return {
      data: transformedCafes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const cafe = await this.prisma.cafe.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${id} not found`);
    }

    return {
      ...cafe,
      membersCount: cafe.members.length,
      postsCount: cafe._count.posts,
    };
  }

  async findBySlug(slug: string) {
    const cafe = await this.prisma.cafe.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!cafe) {
      throw new NotFoundException(`Cafe with slug '${slug}' not found`);
    }

    return {
      ...cafe,
      membersCount: cafe.members.length,
      postsCount: cafe._count.posts,
    };
  }

  async update(id: number, updateCafeDto: UpdateCafeDto, user: { id: number; role: UserRole }) {
    const cafe = await this.findOne(id);

    // Check if user can update this cafe
    if (cafe.ownerId !== user.id && user.role !== UserRole.BARISTA) {
      throw new ForbiddenException('You can only update your own cafes');
    }

    let slug = cafe.slug;
    if (updateCafeDto.name && updateCafeDto.name !== cafe.name) {
      slug = this.generateSlug(updateCafeDto.name);
      
      // Check if new slug already exists
      const existingCafe = await this.prisma.cafe.findUnique({
        where: { slug },
      });

      if (existingCafe && existingCafe.id !== id) {
        throw new BadRequestException('A cafe with this name already exists');
      }
    }

    const updatedCafe = await this.prisma.cafe.update({
      where: { id },
      data: {
        ...updateCafeDto,
        slug,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    return {
      ...updatedCafe,
      membersCount: updatedCafe._count.members,
      postsCount: updatedCafe._count.posts,
    };
  }

  async remove(id: number, user: { id: number; role: UserRole }) {
    const cafe = await this.findOne(id);

    // Check if user can delete this cafe
    if (cafe.ownerId !== user.id && user.role !== UserRole.BARISTA) {
      throw new ForbiddenException('You can only delete your own cafes');
    }

    await this.prisma.cafe.delete({
      where: { id },
    });

    return { message: 'Cafe deleted successfully' };
  }

  // Member Management
  async joinCafe(cafeId: number, userId: number) {
    const cafe = await this.findOne(cafeId);

    if (cafe.isPrivate) {
      throw new ForbiddenException('This cafe is private');
    }

    // Check if already a member
    const existingMembership = await this.prisma.cafeMember.findUnique({
      where: {
        cafeId_userId: {
          cafeId,
          userId,
        },
      },
    });

    if (existingMembership) {
      throw new BadRequestException('Already a member of this cafe');
    }

    await this.prisma.cafeMember.create({
      data: {
        cafeId,
        userId,
      },
    });

    return { message: 'Successfully joined cafe' };
  }

  async leaveCafe(cafeId: number, userId: number) {
    const cafe = await this.findOne(cafeId);

    // Check if owner is trying to leave
    if (cafe.ownerId === userId) {
      throw new ForbiddenException('Cafe owner cannot leave the cafe');
    }

    const membership = await this.prisma.cafeMember.findUnique({
      where: {
        cafeId_userId: {
          cafeId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new BadRequestException('Not a member of this cafe');
    }

    await this.prisma.cafeMember.delete({
      where: {
        cafeId_userId: {
          cafeId,
          userId,
        },
      },
    });

    return { message: 'Successfully left cafe' };
  }

  // Cafe Posts Management
  async createPost(cafeId: number, createCafePostDto: CreateCafePostDto, authorId: number) {
    const cafe = await this.findOne(cafeId);

    // Check if user is a member
    const membership = await this.prisma.cafeMember.findUnique({
      where: {
        cafeId_userId: {
          cafeId,
          userId: authorId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You must be a member to post in this cafe');
    }

    const post = await this.prisma.cafePost.create({
      data: {
        ...createCafePostDto,
        cafeId,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        cafe: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return post;
  }

  async getCafePosts(cafeId: number, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const [posts, total] = await Promise.all([
      this.prisma.cafePost.findMany({
        where: { cafeId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.cafePost.count({ where: { cafeId } }),
    ]);

    return {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateCafePost(postId: number, updateCafePostDto: UpdateCafePostDto, user: { id: number; role: UserRole }) {
    const post = await this.prisma.cafePost.findUnique({
      where: { id: postId },
      include: {
        cafe: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Cafe post with ID ${postId} not found`);
    }

    // Check if user can update this post
    if (post.authorId !== user.id && post.cafe.ownerId !== user.id && user.role !== UserRole.BARISTA) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const updatedPost = await this.prisma.cafePost.update({
      where: { id: postId },
      data: updateCafePostDto,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        cafe: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return updatedPost;
  }

  async deleteCafePost(postId: number, user: { id: number; role: UserRole }) {
    const post = await this.prisma.cafePost.findUnique({
      where: { id: postId },
      include: {
        cafe: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Cafe post with ID ${postId} not found`);
    }

    // Check if user can delete this post
    if (post.authorId !== user.id && post.cafe.ownerId !== user.id && user.role !== UserRole.BARISTA) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.cafePost.delete({
      where: { id: postId },
    });

    return { message: 'Cafe post deleted successfully' };
  }

  // Helper Methods
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }
}
