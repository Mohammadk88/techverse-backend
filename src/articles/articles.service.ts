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
import { ScheduleArticleDto } from './dto/schedule-article.dto';
import { BoostArticleDto } from './dto/boost-article.dto';
import { EnhanceArticleDto } from './dto/enhance-article.dto';
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

  // =======================================================
  // ARTICLE SCHEDULING SYSTEM
  // =======================================================

  async scheduleArticle(articleId: number, scheduleDto: any, userId: number) {
    // Check if article exists and user owns it
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { authorId: true, isPublished: true, title: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('You can only schedule your own articles');
    }

    if (article.isPublished) {
      throw new ConflictException('Cannot schedule already published article');
    }

    // Check if article already has a scheduled post
    const existingSchedule = await this.prisma.scheduledPost.findUnique({
      where: { articleId },
    });

    if (existingSchedule) {
      throw new ConflictException('Article already has a scheduled post');
    }

    const publishAt = new Date(scheduleDto.publishAt);
    const now = new Date();

    if (publishAt <= now) {
      throw new ConflictException('Cannot schedule article for past date');
    }

    return this.prisma.scheduledPost.create({
      data: {
        articleId,
        userId,
        publishAt,
        aiEnhanced: scheduleDto.aiEnhanced || false,
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  async getScheduledPosts(userId: number) {
    return this.prisma.scheduledPost.findMany({
      where: { userId },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            featuredImage: true,
          },
        },
      },
      orderBy: {
        publishAt: 'asc',
      },
    });
  }

  async cancelScheduledPost(scheduleId: number, userId: number) {
    const scheduledPost = await this.prisma.scheduledPost.findUnique({
      where: { id: scheduleId },
      select: { userId: true },
    });

    if (!scheduledPost) {
      throw new NotFoundException('Scheduled post not found');
    }

    if (scheduledPost.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own scheduled posts');
    }

    await this.prisma.scheduledPost.update({
      where: { id: scheduleId },
      data: { status: 'CANCELED' },
    });

    return { message: 'Scheduled post canceled successfully' };
  }

  // =======================================================
  // ARTICLE BOOSTING SYSTEM
  // =======================================================

  async boostArticle(articleId: number, boostDto: any, userId: number) {
    // Check if article exists and is published
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { 
        id: true, 
        title: true, 
        slug: true, 
        isPublished: true, 
        authorId: true 
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (!article.isPublished) {
      throw new ConflictException('Can only boost published articles');
    }

    // Check user's wallet balance
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: { techCoin: true },
    });

    if (!wallet || wallet.techCoin < boostDto.coinSpent) {
      throw new ConflictException('Insufficient TechCoin balance');
    }

    const startDate = new Date(boostDto.startDate);
    const endDate = new Date(boostDto.endDate);
    const now = new Date();

    if (startDate >= endDate) {
      throw new ConflictException('End date must be after start date');
    }

    if (endDate <= now) {
      throw new ConflictException('End date must be in the future');
    }

    // Check for overlapping boosts
    const overlappingBoost = await this.prisma.articleBoost.findFirst({
      where: {
        articleId,
        OR: [
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } },
            ],
          },
          {
            AND: [
              { startDate: { gte: startDate } },
              { endDate: { lte: endDate } },
            ],
          },
        ],
      },
    });

    if (overlappingBoost) {
      throw new ConflictException('Article already has a boost in this time period');
    }

    // Deduct coins from wallet and create boost
    const [boost] = await this.prisma.$transaction([
      this.prisma.articleBoost.create({
        data: {
          articleId,
          userId,
          coinSpent: boostDto.coinSpent,
          startDate,
          endDate,
        },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.wallet.update({
        where: { userId },
        data: { techCoin: { decrement: boostDto.coinSpent } },
      }),
      this.prisma.walletTransaction.create({
        data: {
          userId,
          type: 'SPEND',
          amount: boostDto.coinSpent,
          description: `Article boost: ${article.title}`,
        },
      }),
    ]);

    return boost;
  }

  async getArticleBoosts(articleId: number) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.prisma.articleBoost.findMany({
      where: { articleId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUserBoosts(userId: number) {
    return this.prisma.articleBoost.findMany({
      where: { userId },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            featuredImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // =======================================================
  // AI ENHANCEMENT SYSTEM
  // =======================================================

  async enhanceArticleWithAI(articleId: number, enhanceDto: any, userId: number) {
    // Check if article exists and user owns it
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { 
        authorId: true, 
        title: true, 
        content: true, 
        excerpt: true 
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('You can only enhance your own articles');
    }

    // Check user's wallet balance
    const enhancementCosts = {
      TITLE_OPTIMIZATION: 20,
      SUMMARY_GENERATION: 30,
      SEO_TAGS: 25,
      FULL_ENHANCEMENT: 100,
    };

    const coinCost = enhancementCosts[enhanceDto.enhancementType];
    
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: { techCoin: true },
    });

    if (!wallet || wallet.techCoin < coinCost) {
      throw new ConflictException('Insufficient TechCoin balance');
    }

    // Get original value based on enhancement type
    let originalValue = '';
    switch (enhanceDto.enhancementType) {
      case 'TITLE_OPTIMIZATION':
        originalValue = article.title;
        break;
      case 'SUMMARY_GENERATION':
        originalValue = article.excerpt || '';
        break;
      case 'SEO_TAGS':
        originalValue = 'Current article tags';
        break;
      case 'FULL_ENHANCEMENT':
        originalValue = article.content;
        break;
    }

    // Generate AI enhancement (simplified mock for now)
    let enhancedValue = '';
    try {
      switch (enhanceDto.enhancementType) {
        case 'TITLE_OPTIMIZATION':
          enhancedValue = `[ENHANCED] ${article.title}`;
          break;
        case 'SUMMARY_GENERATION':
          enhancedValue = `AI-generated summary for: ${article.title.substring(0, 100)}...`;
          break;
        case 'SEO_TAGS':
          enhancedValue = 'tech, programming, development, coding';
          break;
        case 'FULL_ENHANCEMENT':
          enhancedValue = `${article.content}\n\n[AI Enhanced Content Added]`;
          break;
      }
    } catch (error) {
      throw new ConflictException('AI enhancement failed. Please try again.');
    }

    // Create enhancement record and deduct coins
    const [enhancement] = await this.prisma.$transaction([
      this.prisma.articleAIEnhancement.create({
        data: {
          articleId,
          userId,
          enhancementType: enhanceDto.enhancementType,
          originalValue,
          enhancedValue,
          coinSpent: coinCost,
        },
      }),
      this.prisma.wallet.update({
        where: { userId },
        data: { techCoin: { decrement: coinCost } },
      }),
      this.prisma.walletTransaction.create({
        data: {
          userId,
          type: 'SPEND',
          amount: coinCost,
          description: `AI Enhancement: ${enhanceDto.enhancementType}`,
        },
      }),
    ]);

    return enhancement;
  }

  async applyAIEnhancement(enhancementId: number, userId: number) {
    const enhancement = await this.prisma.articleAIEnhancement.findUnique({
      where: { id: enhancementId },
      include: {
        article: {
          select: {
            id: true,
            authorId: true,
            title: true,
          },
        },
      },
    });

    if (!enhancement) {
      throw new NotFoundException('Enhancement not found');
    }

    if (enhancement.userId !== userId) {
      throw new ForbiddenException('You can only apply your own enhancements');
    }

    if (enhancement.isApplied) {
      throw new ConflictException('Enhancement already applied');
    }

    // Apply the enhancement to the article
    const updateData: any = {};
    switch (enhancement.enhancementType) {
      case 'TITLE_OPTIMIZATION':
        updateData.title = enhancement.enhancedValue;
        updateData.slug = this.generateSlug(enhancement.enhancedValue);
        break;
      case 'SUMMARY_GENERATION':
        updateData.excerpt = enhancement.enhancedValue;
        break;
      case 'FULL_ENHANCEMENT':
        updateData.content = enhancement.enhancedValue;
        break;
      // SEO_TAGS would need separate handling for tags
    }

    await this.prisma.$transaction([
      this.prisma.article.update({
        where: { id: enhancement.articleId },
        data: updateData,
      }),
      this.prisma.articleAIEnhancement.update({
        where: { id: enhancementId },
        data: { isApplied: true },
      }),
    ]);

    return { message: 'Enhancement applied successfully' };
  }

  async getArticleEnhancements(articleId: number, userId: number) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { authorId: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('You can only view enhancements for your own articles');
    }

    return this.prisma.articleAIEnhancement.findMany({
      where: { articleId },
      orderBy: {
        createdAt: 'desc',
      },
    });
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
