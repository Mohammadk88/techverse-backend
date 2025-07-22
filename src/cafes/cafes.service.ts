import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { CreateCafeDto, UpdateCafeDto, CreateCafePostDto, UpdateCafePostDto, CafeFilterDto } from './dto/cafe.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { user_roles } from '@prisma/client';
import { ContentQueryService } from '../common/services/content-query.service';

@Injectable()
export class CafesService {
  private readonly CAFE_CREATION_COST = 50; // TechCoin cost to create a cafe

  constructor(
    private readonly prisma: PrismaService,
    private readonly contentQueryService: ContentQueryService,
    private readonly walletService: WalletService,
  ) {}

  // Cafe Management
  async create(createCafeDto: CreateCafeDto, owner_id: number) {
    // Check if user has enough TechCoin
    const hasEnough = await this.walletService.hasEnoughTechCoin(
      owner_id,
      this.CAFE_CREATION_COST,
    );

    if (!hasEnough) {
      throw new BadRequestException(
        `Insufficient TechCoin. Need ${this.CAFE_CREATION_COST} TechCoin to create a cafe.`,
      );
    }

    // Generate slug from name
    const slug = this.generateSlug(createCafeDto.name);
    
    // Check if slug already exists
    const existingCafe = await this.prisma.cafes.findUnique({
      where: { slug },
    });

    if (existingCafe) {
      throw new BadRequestException('A cafe with this name already exists');
    }

    // Deduct TechCoin for cafe creation
    await this.walletService.spendTechCoin(owner_id, {
      amount: this.CAFE_CREATION_COST,
      description: `Created cafe: ${createCafeDto.name}`,
    });

    const cafe = await this.prisma.cafes.create({
      data: {
        ...createCafeDto,
        slug,
        owner_id,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        _count: {
          select: {
            cafe_members: true,
            cafe_posts: true,
          },
        },
      },
    });

    // Auto-join the owner as a member
    await this.prisma.cafe_members.create({
      data: {
        cafe_id: cafe.id,
        user_id: owner_id,
      },
    });

    return {
      ...cafe,
      membersCount: cafe._count.cafe_members + 1, // +1 for the owner
      postsCount: cafe._count.cafe_posts,
    };
  }

  async findAll(paginationDto: PaginationDto, filterDto?: Omit<CafeFilterDto, keyof PaginationDto>) {
    const { page = 1, limit = 10 } = paginationDto;
    const { 
      search, 
      is_private, 
      owner_id, 
      popular,
      language_code,
      country_code
    } = filterDto || {};
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (is_private !== undefined) where.is_private = is_private;
    if (owner_id) where.owner_id = owner_id;

    // Add localization filtering
    if (language_code || country_code) {
      const localizedWhere = this.contentQueryService.createLocalizedWhereClause({
        language_code,
        country_code,
      });
      Object.assign(where, localizedWhere);
    }

    // Handle popular cafes (example: cafes with more members)
    let orderBy: any = { created_at: 'desc' };
    if (popular) {
      orderBy = {
        cafe_members: {
          _count: 'desc',
        },
      };
    }

    const [cafes, total] = await Promise.all([
      this.prisma.cafes.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              cafe_members: true,
              cafe_posts: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.cafes.count({ where }),
    ]);

    const transformedCafes = cafes.map((cafe) => ({
      ...cafe,
      membersCount: cafe._count.cafe_members,
      postsCount: cafe._count.cafe_posts,
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
    const cafe = await this.prisma.cafes.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        cafe_members: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: { joined_at: 'asc' },
        },
        _count: {
          select: {
            cafe_posts: true,
          },
        },
      },
    });

    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${id} not found`);
    }

    return {
      ...cafe,
      membersCount: cafe.cafe_members.length,
      postsCount: cafe._count.cafe_posts,
    };
  }

  async findBySlug(slug: string) {
    const cafe = await this.prisma.cafes.findUnique({
      where: { slug },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        cafe_members: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: { joined_at: 'asc' },
        },
        _count: {
          select: {
            cafe_posts: true,
          },
        },
      },
    });

    if (!cafe) {
      throw new NotFoundException(`Cafe with slug '${slug}' not found`);
    }

    return {
      ...cafe,
      membersCount: cafe.cafe_members.length,
      postsCount: cafe._count.cafe_posts,
    };
  }

  async update(id: number, updateCafeDto: UpdateCafeDto, user: { id: number; role: user_roles }) {
    const cafe = await this.findOne(id);

    // Check if user can update this cafe
    if (cafe.owner_id !== user.id && user.role !== user_roles.BARISTA) {
      throw new ForbiddenException('You can only update your own cafes');
    }

    let slug = cafe.slug;
    if (updateCafeDto.name && updateCafeDto.name !== cafe.name) {
      slug = this.generateSlug(updateCafeDto.name);
      
      // Check if new slug already exists
      const existingCafe = await this.prisma.cafes.findUnique({
        where: { slug },
      });

      if (existingCafe && existingCafe.id !== id) {
        throw new BadRequestException('A cafe with this name already exists');
      }
    }

    const updatedCafe = await this.prisma.cafes.update({
      where: { id },
      data: {
        ...updateCafeDto,
        slug,
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        _count: {
          select: {
            cafe_members: true,
            cafe_posts: true,
          },
        },
      },
    });

    return {
      ...updatedCafe,
      membersCount: updatedCafe._count.cafe_members,
      postsCount: updatedCafe._count.cafe_posts,
    };
  }

  async remove(id: number, user: { id: number; role: user_roles }) {
    const cafe = await this.findOne(id);

    // Check if user can delete this cafe
    if (cafe.owner_id !== user.id && user.role !== user_roles.BARISTA) {
      throw new ForbiddenException('You can only delete your own cafes');
    }

    await this.prisma.cafes.delete({
      where: { id },
    });

    return { message: 'Cafe deleted successfully' };
  }

  // Member Management
  async joinCafe(cafe_id: number, user_id: number) {
    const cafe = await this.findOne(cafe_id);

    if (cafe.is_private) {
      throw new ForbiddenException('This cafe is private');
    }

    // Check if already a member
    const existingMembership = await this.prisma.cafe_members.findUnique({
      where: {
        cafe_id_user_id: {
          cafe_id,
          user_id,
        },
      },
    });

    if (existingMembership) {
      throw new BadRequestException('Already a member of this cafe');
    }

    await this.prisma.cafe_members.create({
      data: {
        cafe_id,
        user_id,
      },
    });

    return { message: 'Successfully joined cafe' };
  }

  async leaveCafe(cafe_id: number, user_id: number) {
    const cafe = await this.findOne(cafe_id);

    // Check if owner is trying to leave
    if (cafe.owner_id === user_id) {
      throw new ForbiddenException('Cafe owner cannot leave the cafe');
    }

    const membership = await this.prisma.cafe_members.findUnique({
      where: {
        cafe_id_user_id: {
          cafe_id,
          user_id,
        },
      },
    });

    if (!membership) {
      throw new BadRequestException('Not a member of this cafe');
    }

    await this.prisma.cafe_members.delete({
      where: {
        cafe_id_user_id: {
          cafe_id,
          user_id,
        },
      },
    });

    return { message: 'Successfully left cafe' };
  }

  // Cafe Posts Management
  async createPost(cafe_id: number, createCafePostDto: CreateCafePostDto, author_id: number) {
    const cafe = await this.findOne(cafe_id);

    // Check if user is a member
    const membership = await this.prisma.cafe_members.findUnique({
      where: {
        cafe_id_user_id: {
          cafe_id,
          user_id: author_id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You must be a member to post in this cafe');
    }

    const post = await this.prisma.cafe_posts.create({
      data: {
        ...createCafePostDto,
        cafe_id,
        author_id,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        cafes: {
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

  async getCafePosts(cafe_id: number, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const [posts, total] = await Promise.all([
      this.prisma.cafe_posts.findMany({
        where: { cafe_id },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.cafe_posts.count({ where: { cafe_id } }),
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

  async updateCafePost(postId: number, updateCafePostDto: UpdateCafePostDto, user: { id: number; role: user_roles }) {
    const post = await this.prisma.cafe_posts.findUnique({
      where: { id: postId },
      include: {
        cafes: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Cafe post with ID ${postId} not found`);
    }

    // Check if user can update this post
    if (post.author_id !== user.id && post.cafes.owner_id !== user.id && user.role !== user_roles.BARISTA) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const updatedPost = await this.prisma.cafe_posts.update({
      where: { id: postId },
      data: updateCafePostDto,
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        cafes: {
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

  async deleteCafePost(postId: number, user: { id: number; role: user_roles }) {
    const post = await this.prisma.cafe_posts.findUnique({
      where: { id: postId },
      include: {
        cafes: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Cafe post with ID ${postId} not found`);
    }

    // Check if user can delete this post
    if (post.author_id !== user.id && post.cafes.owner_id !== user.id && user.role !== user_roles.BARISTA) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.cafe_posts.delete({
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
