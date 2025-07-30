import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { WalletService } from '../wallet/wallet.service';
import {
  CreateArticleDto,
  UpdateArticleDto,
  CreateCategoryDto,
  CreateTagDto,
  ArticleFilterDto,
  AIGenerateArticleDto,
} from './dto/article.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { AIService } from '../ai/ai.service';
import { ContentQueryService } from '../common/services/content-query.service';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly aiService: AIService,
    private readonly contentQueryService: ContentQueryService,
    private readonly walletService: WalletService,
  ) {}

  // Article CRUD Operations
  async create(createArticleDto: CreateArticleDto, author_id: number) {
    const { tagIds, scheduled_for, ...articleData } = createArticleDto;

    // Generate slug from title
    const slug = this.generateSlug(articleData.title);

    // Check if slug already exists
    const existingArticle = await this.prisma.articles.findUnique({
      where: { slug },
    });

    if (existingArticle) {
      throw new ConflictException('Article with this title already exists');
    }

    // Handle scheduling logic
    let published_at: Date | null = null;
    let is_published = articleData.is_published || false;
    
    if (scheduled_for) {
      const scheduleDate = new Date(scheduled_for);
      const now = new Date();
      
      if (scheduleDate <= now) {
        // If scheduled time is in the past or now, publish immediately
        is_published = true;
        published_at = now;
      } else {
        // Schedule for future
        is_published = false;
        published_at = null;
      }
    } else if (is_published) {
      published_at = new Date();
    }

    const article = await this.prisma.articles.create({
      data: {
        ...articleData,
        slug,
        author_id,
        is_published,
        published_at,
        scheduled_for: scheduled_for ? new Date(scheduled_for) : null,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            avatar: true,
          },
        },
        article_categories: true,
        article_tag_relations: {
          include: {
            article_tags: true,
          },
        },
      },
    });

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      await this.prisma.article_tag_relations.createMany({
        data: tagIds.map((tag_id) => ({
          article_id: article.id,
          tag_id,
        })),
      });
    }

    // Award XP for publishing an article
    if (is_published) {
      try {
        await this.walletService.awardXPForActivity(
          author_id,
          'ARTICLE_PUBLISH',
        );
      } catch (error) {
        console.error('Failed to award XP for article publication:', error);
        // Don't fail the article creation if XP fails
      }
    }

    return this.findOne(article.id);
  }

  async findAll(
    paginationDto: PaginationDto,
    filterDto: ArticleFilterDto,
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const { 
      category_id, 
      tag_id, 
      search, 
      is_published, 
      is_ai, 
      status, 
      featured, 
      thisWeek,
      language_code,
      country_code 
    } = filterDto;
    const skip = (page - 1) * limit;

    let baseWhere: any = {};

    if (category_id) {
      baseWhere.category_id = category_id;
    }

    if (tag_id) {
      baseWhere.article_tag_relations = {
        some: {
          tag_id,
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

    if (is_published !== undefined) {
      baseWhere.is_published = is_published;
    }

    if (is_ai !== undefined) {
      baseWhere.is_ai = is_ai;
    }

    if (featured !== undefined) {
      baseWhere.featured = featured;
    }

    // Handle thisWeek filter
    if (thisWeek) {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      baseWhere.created_at = {
        gte: weekAgo,
      };
    }

    // Handle status filter
    if (status) {
      const now = new Date();
      switch (status) {
        case 'published':
          baseWhere.is_published = true;
          break;
        case 'draft':
          baseWhere.is_published = false;
          baseWhere.scheduled_for = null;
          break;
        case 'scheduled':
          baseWhere.is_published = false;
          baseWhere.scheduled_for = {
            gt: now,
          };
          break;
      }
    }

    // Apply localization filtering
    const where = this.contentQueryService.createLocalizedWhereClause(
      baseWhere, 
      { language_code, country_code }
    );

    const [articles, total] = await Promise.all([
      this.prisma.articles.findMany({
        where,
        skip,
        take: limit,
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              username: true,
              avatar: true,
            },
          },
          article_categories: true,
          article_tag_relations: {
            include: {
              article_tags: true,
            },
          },
          _count: {
            select: {
              bookmarks: true,
            },
          },
        },
        orderBy: {
          published_at: 'desc',
        },
      }),
      this.prisma.articles.count({ where }),
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
    const article = await this.prisma.articles.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
        article_categories: true,
        article_tag_relations: {
          include: {
            article_tags: true,
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
    const article = await this.prisma.articles.findUnique({
      where: { slug },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
        article_categories: true,
        article_tag_relations: {
          include: {
            article_tags: true,
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

  async update(id: number, updateArticleDto: UpdateArticleDto, user_id: number) {
    const existingArticle = await this.prisma.articles.findUnique({
      where: { id },
      select: { author_id: true, is_published: true },
    });

    if (!existingArticle) {
      throw new NotFoundException('Article not found');
    }

    if (existingArticle.author_id !== user_id) {
      throw new ForbiddenException('You can only update your own articles');
    }

    const { tagIds, ...articleData } = updateArticleDto;

    // Update slug if title is changed
    if (articleData.title) {
      const slug = this.generateSlug(articleData.title);
      const existingSlug = await this.prisma.articles.findUnique({
        where: { slug },
      });

      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException('Article with this title already exists');
      }

      articleData['slug'] = slug;
    }

    // Set published_at if publishing for the first time
    if (articleData.is_published && !existingArticle.is_published) {
      articleData['published_at'] = new Date();
      // Award XP for publishing
      await this.authService.addXP(user_id, 50);
    }

    const article = await this.prisma.articles.update({
      where: { id },
      data: articleData,
    });

    // Update tags if provided
    if (tagIds !== undefined) {
      // Remove existing tag relations
      await this.prisma.article_tag_relations.deleteMany({
        where: { article_id: id },
      });

      // Add new tag relations
      if (tagIds.length > 0) {
        await this.prisma.article_tag_relations.createMany({
          data: tagIds.map((tag_id) => ({
            article_id: id,
            tag_id,
          })),
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: number, user_id: number, userRole: string) {
    const article = await this.prisma.articles.findUnique({
      where: { id },
      select: { author_id: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Only author or admin can delete
    if (article.author_id !== user_id && userRole !== 'BARISTA') {
      throw new ForbiddenException('Insufficient permissions');
    }

    await this.prisma.articles.delete({
      where: { id },
    });

    return { message: 'Article deleted successfully' };
  }

  // Category Management
  async createCategory(createCategoryDto: CreateCategoryDto) {
    const slug = this.generateSlug(createCategoryDto.name);

    const existingCategory = await this.prisma.article_categories.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    return this.prisma.article_categories.create({
      data: {
        ...createCategoryDto,
        slug,
        updated_at: new Date(),
      },
    });
  }

  async findAllCategories() {
    return this.prisma.article_categories.findMany({
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

    const existingTag = await this.prisma.article_tags.findUnique({
      where: { slug },
    });

    if (existingTag) {
      throw new ConflictException('Tag with this name already exists');
    }

    return this.prisma.article_tags.create({
      data: {
        ...createTagDto,
        slug,
        updated_at: new Date(),
      },
    });
  }

  async findAllTags() {
    return this.prisma.article_tags.findMany({
      include: {
        _count: {
          select: {
            article_tag_relations: true,
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
    author_id: number,
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
      category_id: generateDto.category_id,
      tagIds: generateDto.tagIds,
      is_published: generateDto.publishNow || false,
      scheduled_for: generateDto.scheduled_for,
      is_ai: true,
      aiPrompt: generateDto.prompt,
    };

    return this.create(createArticleDto, author_id);
  }

  // =======================================================
  // ARTICLE SCHEDULING SYSTEM
  // =======================================================

  async scheduleArticle(article_id: number, scheduleDto: any, user_id: number) {
    // Check if article exists and user owns it
    const article = await this.prisma.articles.findUnique({
      where: { id: article_id },
      select: { author_id: true, is_published: true, title: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.author_id !== user_id) {
      throw new ForbiddenException('You can only schedule your own articles');
    }

    if (article.is_published) {
      throw new ConflictException('Cannot schedule already published article');
    }

    // Check if article already has a scheduled post
    const existingSchedule = await this.prisma.scheduled_posts.findUnique({
      where: { article_id },
    });

    if (existingSchedule) {
      throw new ConflictException('Article already has a scheduled post');
    }

    const publishAt = new Date(scheduleDto.publishAt);
    const now = new Date();

    if (publishAt <= now) {
      throw new ConflictException('Cannot schedule article for past date');
    }

    return this.prisma.scheduled_posts.create({
      data: {
        article_id,
        user_id,
        publish_at: publishAt,
        ai_enhanced: scheduleDto.aiEnhanced || false,
        updated_at: new Date(),
      },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  async getScheduledPosts(user_id: number) {
    return this.prisma.scheduled_posts.findMany({
      where: { user_id },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            featured_image: true,
          },
        },
      },
      orderBy: {
        publish_at: 'asc',
      },
    });
  }

  async cancelScheduledPost(scheduleId: number, user_id: number) {
    const scheduledPost = await this.prisma.scheduled_posts.findUnique({
      where: { id: scheduleId },
      select: { user_id: true },
    });

    if (!scheduledPost) {
      throw new NotFoundException('Scheduled post not found');
    }

    if (scheduledPost.user_id !== user_id) {
      throw new ForbiddenException('You can only cancel your own scheduled posts');
    }

    await this.prisma.scheduled_posts.update({
      where: { id: scheduleId },
      data: { status: 'CANCELED' },
    });

    return { message: 'Scheduled post canceled successfully' };
  }

  // =======================================================
  // ARTICLE BOOSTING SYSTEM
  // =======================================================

  async boostArticle(article_id: number, boostDto: any, user_id: number) {
    // Check if article exists and is published
    const article = await this.prisma.articles.findUnique({
      where: { id: article_id },
      select: { 
        id: true, 
        title: true, 
        slug: true, 
        is_published: true, 
        author_id: true 
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (!article.is_published) {
      throw new ConflictException('Can only boost published articles');
    }

    // Check user's wallet balance
    const wallet = await this.prisma.wallets.findUnique({
      where: { user_id },
      select: { tech_coin: true },
    });

    if (!wallet || wallet.tech_coin < boostDto.coinSpent) {
      throw new ConflictException('Insufficient TechCoin balance');
    }

    const start_date = new Date(boostDto.start_date);
    const end_date = new Date(boostDto.end_date);
    const now = new Date();

    if (start_date >= end_date) {
      throw new ConflictException('End date must be after start date');
    }

    if (end_date <= now) {
      throw new ConflictException('End date must be in the future');
    }

    // Check for overlapping boosts
    const overlappingBoost = await this.prisma.article_boosts.findFirst({
      where: {
        article_id,
        OR: [
          {
            AND: [
              { start_date: { lte: start_date } },
              { end_date: { gte: start_date } },
            ],
          },
          {
            AND: [
              { start_date: { lte: end_date } },
              { end_date: { gte: end_date } },
            ],
          },
          {
            AND: [
              { start_date: { gte: start_date } },
              { end_date: { lte: end_date } },
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
      this.prisma.article_boosts.create({
        data: {
          article_id,
          user_id,
          coin_spent: boostDto.coinSpent,
          start_date,
          end_date,
        },
        include: {
          articles: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.wallets.update({
        where: { user_id },
        data: { tech_coin: { decrement: boostDto.coinSpent } },
      }),
      this.prisma.wallet_transactions.create({
        data: {
          user_id,
          type: 'SPEND',
          amount: boostDto.coinSpent,
          description: `Article boost: ${article.title}`,
        },
      }),
    ]);

    return boost;
  }

  async getArticleBoosts(article_id: number) {
    const article = await this.prisma.articles.findUnique({
      where: { id: article_id },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.prisma.article_boosts.findMany({
      where: { article_id },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getUserBoosts(user_id: number) {
    return this.prisma.article_boosts.findMany({
      where: { user_id },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            slug: true,
            featured_image: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // =======================================================
  // AI ENHANCEMENT SYSTEM
  // =======================================================

  async enhanceArticleWithAI(article_id: number, enhanceDto: any, user_id: number) {
    // Check if article exists and user owns it
    const article = await this.prisma.articles.findUnique({
      where: { id: article_id },
      select: { 
        author_id: true, 
        title: true, 
        content: true, 
        excerpt: true 
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.author_id !== user_id) {
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
    
    const wallet = await this.prisma.wallets.findUnique({
      where: { user_id },
      select: { tech_coin: true },
    });

    if (!wallet || wallet.tech_coin < coinCost) {
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
        originalValue = 'Current article.article_tag_relations';
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
      this.prisma.article_ai_enhancements.create({
        data: {
          article_id,
          user_id,
          enhancement_type: enhanceDto.enhancementType,
          original_value: originalValue,
          enhanced_value: enhancedValue,
          coin_spent: coinCost,
        },
      }),
      this.prisma.wallets.update({
        where: { user_id },
        data: { tech_coin: { decrement: coinCost } },
      }),
      this.prisma.wallet_transactions.create({
        data: {
          user_id,
          type: 'SPEND',
          amount: coinCost,
          description: `AI Enhancement: ${enhanceDto.enhancementType}`,
        },
      }),
    ]);

    return enhancement;
  }

  async applyAIEnhancement(enhancementId: number, user_id: number) {
    const enhancement = await this.prisma.article_ai_enhancements.findUnique({
      where: { id: enhancementId },
      include: {
        articles: {
          select: {
            id: true,
            author_id: true,
            title: true,
          },
        },
      },
    });

    if (!enhancement) {
      throw new NotFoundException('Enhancement not found');
    }

    if (enhancement.user_id !== user_id) {
      throw new ForbiddenException('You can only apply your own enhancements');
    }

    if (enhancement.is_applied) {
      throw new ConflictException('Enhancement already applied');
    }

    // Apply the enhancement to the article
    const updateData: any = {};
    switch (enhancement.enhancement_type) {
      case 'TITLE_OPTIMIZATION':
        updateData.title = enhancement.enhanced_value;
        updateData.slug = this.generateSlug(enhancement.enhanced_value);
        break;
      case 'SUMMARY_GENERATION':
        updateData.excerpt = enhancement.enhanced_value;
        break;
      case 'FULL_ENHANCEMENT':
        updateData.content = enhancement.enhanced_value;
        break;
      // SEO_TAGS would need separate handling for tags
    }

    await this.prisma.$transaction([
      this.prisma.articles.update({
        where: { id: enhancement.article_id },
        data: updateData,
      }),
      this.prisma.article_ai_enhancements.update({
        where: { id: enhancementId },
        data: { is_applied: true },
      }),
    ]);

    return { message: 'Enhancement applied successfully' };
  }

  async getArticleEnhancements(article_id: number, user_id: number) {
    const article = await this.prisma.articles.findUnique({
      where: { id: article_id },
      select: { author_id: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.author_id !== user_id) {
      throw new ForbiddenException('You can only view enhancements for your own articles');
    }

    return this.prisma.article_ai_enhancements.findMany({
      where: { article_id },
      orderBy: {
        created_at: 'desc',
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
