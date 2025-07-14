import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import {
  CreateArticleDto,
  UpdateArticleDto,
  CreateCategoryDto,
  CreateTagDto,
  ArticleFilterDto,
  AIGenerateArticleDto,
} from './dto/article.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { UserRole } from '../common/decorators/roles.decorator';
import { AIService } from '../ai/ai.service';
import { ContentQueryService } from '../common/services/content-query.service';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly aiService: AIService,
    private readonly contentQueryService: ContentQueryService,
  ) {}

  // Article CRUD Operations
  async create(createArticleDto: CreateArticleDto, authorId: number) {
    const { tagIds, scheduledFor, ...articleData } = createArticleDto;

    // Generate slug from title
    const slug = this.generateSlug(articleData.title);

    // Check if slug already exists
    const existingArticle = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (existingArticle) {
      throw new ConflictException('Article with this title already exists');
    }

    // Handle scheduling logic
    let publishedAt: Date | null = null;
    let isPublished = articleData.isPublished || false;
    
    if (scheduledFor) {
      const scheduleDate = new Date(scheduledFor);
      const now = new Date();
      
      if (scheduleDate <= now) {
        // If scheduled time is in the past or now, publish immediately
        isPublished = true;
        publishedAt = now;
      } else {
        // Schedule for future
        isPublished = false;
        publishedAt = null;
      }
    } else if (isPublished) {
      publishedAt = new Date();
    }

    const article = await this.prisma.article.create({
      data: {
        ...articleData,
        slug,
        authorId,
        isPublished,
        publishedAt,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      await this.prisma.articleTagRelation.createMany({
        data: tagIds.map((tagId) => ({
          articleId: article.id,
          tagId,
        })),
      });
    }

    // Award XP for publishing an article
    if (isPublished) {
      await this.authService.addXP(authorId, 50);
    }

    return this.findOne(article.id);
  }

  async findAll(
    paginationDto: PaginationDto,
    filterDto: ArticleFilterDto,
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const { 
      categoryId, 
      tagId, 
      search, 
      isPublished, 
      isAI, 
      status, 
      featured, 
      thisWeek,
      languageCode,
      countryCode 
    } = filterDto;
    const skip = (page - 1) * limit;

    let baseWhere: any = {};

    if (categoryId) {
      baseWhere.categoryId = categoryId;
    }

    if (tagId) {
      baseWhere.tags = {
        some: {
          tagId,
        },
      };
    }

    if (search) {
      baseWhere.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isPublished !== undefined) {
      baseWhere.isPublished = isPublished;
    }

    if (isAI !== undefined) {
      baseWhere.isAI = isAI;
    }

    if (featured !== undefined) {
      baseWhere.featured = featured;
    }

    // Handle thisWeek filter
    if (thisWeek) {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      baseWhere.createdAt = {
        gte: weekAgo,
      };
    }

    // Handle status filter
    if (status) {
      const now = new Date();
      switch (status) {
        case 'published':
          baseWhere.isPublished = true;
          break;
        case 'draft':
          baseWhere.isPublished = false;
          baseWhere.scheduledFor = null;
          break;
        case 'scheduled':
          baseWhere.isPublished = false;
          baseWhere.scheduledFor = {
            gt: now,
          };
          break;
      }
    }

    // Apply localization filtering
    const where = this.contentQueryService.createLocalizedWhereClause(
      baseWhere, 
      { languageCode, countryCode }
    );

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
            },
          },
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              bookmarks: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data: articles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async update(id: number, updateArticleDto: UpdateArticleDto, userId: number) {
    const existingArticle = await this.prisma.article.findUnique({
      where: { id },
      select: { authorId: true, isPublished: true },
    });

    if (!existingArticle) {
      throw new NotFoundException('Article not found');
    }

    if (existingArticle.authorId !== userId) {
      throw new ForbiddenException('You can only update your own articles');
    }

    const { tagIds, ...articleData } = updateArticleDto;

    // Update slug if title is changed
    if (articleData.title) {
      const slug = this.generateSlug(articleData.title);
      const existingSlug = await this.prisma.article.findUnique({
        where: { slug },
      });

      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException('Article with this title already exists');
      }

      articleData['slug'] = slug;
    }

    // Set publishedAt if publishing for the first time
    if (articleData.isPublished && !existingArticle.isPublished) {
      articleData['publishedAt'] = new Date();
      // Award XP for publishing
      await this.authService.addXP(userId, 50);
    }

    const article = await this.prisma.article.update({
      where: { id },
      data: articleData,
    });

    // Update tags if provided
    if (tagIds !== undefined) {
      // Remove existing tag relations
      await this.prisma.articleTagRelation.deleteMany({
        where: { articleId: id },
      });

      // Add new tag relations
      if (tagIds.length > 0) {
        await this.prisma.articleTagRelation.createMany({
          data: tagIds.map((tagId) => ({
            articleId: id,
            tagId,
          })),
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: number, userId: number, userRole: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Only author or admin can delete
    if (article.authorId !== userId && userRole !== UserRole.BARISTA) {
      throw new ForbiddenException('Insufficient permissions');
    }

    await this.prisma.article.delete({
      where: { id },
    });

    return { message: 'Article deleted successfully' };
  }

  // Category Management
  async createCategory(createCategoryDto: CreateCategoryDto) {
    const slug = this.generateSlug(createCategoryDto.name);

    const existingCategory = await this.prisma.articleCategory.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    return this.prisma.articleCategory.create({
      data: {
        ...createCategoryDto,
        slug,
      },
    });
  }

  async findAllCategories() {
    return this.prisma.articleCategory.findMany({
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // Tag Management
  async createTag(createTagDto: CreateTagDto) {
    const slug = this.generateSlug(createTagDto.name);

    const existingTag = await this.prisma.articleTag.findUnique({
      where: { slug },
    });

    if (existingTag) {
      throw new ConflictException('Tag with this name already exists');
    }

    return this.prisma.articleTag.create({
      data: {
        ...createTagDto,
        slug,
      },
    });
  }

  async findAllTags() {
    return this.prisma.articleTag.findMany({
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // AI-powered article generation
  async generateArticleWithAI(
    generateDto: AIGenerateArticleDto,
    authorId: number,
  ) {
    // Generate content using AI with specified provider
    const aiContent = await this.aiService.generateArticle(
      generateDto.prompt,
      generateDto.provider,
      generateDto.topic,
    );

    // Create the article with AI-generated content
    const createArticleDto: CreateArticleDto = {
      title: aiContent.title,
      content: aiContent.content,
      excerpt: aiContent.excerpt,
      categoryId: generateDto.categoryId,
      tagIds: generateDto.tagIds,
      isPublished: generateDto.publishNow || false,
      scheduledFor: generateDto.scheduledFor,
      isAI: true,
      aiPrompt: generateDto.prompt,
    };

    return this.create(createArticleDto, authorId);
  }

  // Helper Methods
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
