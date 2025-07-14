import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePostDto, UpdatePostDto, PostFilterDto, AIGeneratePostDto } from './dto/post.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole, BookmarkType } from '@prisma/client';
import { AIService } from '../ai/ai.service';
import { ContentQueryService } from '../common/services/content-query.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
    private readonly contentQueryService: ContentQueryService,
  ) {}

  async create(createPostDto: CreatePostDto, authorId: number) {
    const { scheduledFor, ...postData } = createPostDto;

    // Handle scheduling logic
    let publishedAt: Date | null = null;
    let isPublished = createPostDto.isPublished !== undefined ? createPostDto.isPublished : true;
    
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

    const post = await this.prisma.post.create({
      data: {
        ...postData,
        authorId,
        isPublished,
        publishedAt,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return post;
  }

  async findAll(paginationDto: PaginationDto, filterDto?: Omit<PostFilterDto, keyof PaginationDto>) {
    const { page = 1, limit = 10 } = paginationDto;
    const { 
      type, 
      isPublic, 
      authorId, 
      isPublished,
      trending,
      languageCode,
      countryCode,
      ...otherFilters
    } = filterDto || {};
    
    // Base where clause
    const where: any = {};
    
    if (type) where.type = type;
    if (isPublic !== undefined) where.isPublic = isPublic;
    if (authorId) where.authorId = authorId;
    if (isPublished !== undefined) where.isPublished = isPublished;

    // Add localization filtering
    if (languageCode || countryCode) {
      const localizedWhere = this.contentQueryService.createLocalizedWhereClause({
        languageCode,
        countryCode,
      });
      Object.assign(where, localizedWhere);
    }

    // Handle trending (example: posts with high engagement in last 7 days)
    if (trending) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      where.createdAt = {
        gte: sevenDaysAgo,
      };
      // You can add more complex trending logic here based on likes, comments, etc.
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: trending 
          ? [{ createdAt: 'desc' }] // For trending, order by creation date first
          : [{ createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.post.count({ where }),
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

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto, user: { id: number; role: UserRole }) {
    const post = await this.findOne(id);

    // Check if user can update this post
    if (post.authorId !== user.id && user.role !== UserRole.BARISTA) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: updatePostDto,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return updatedPost;
  }

  async remove(id: number, user: { id: number; role: UserRole }) {
    const post = await this.findOne(id);

    // Check if user can delete this post
    if (post.authorId !== user.id && user.role !== UserRole.BARISTA) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({
      where: { id },
    });

    return { message: 'Post deleted successfully' };
  }

  async toggleBookmark(postId: number, userId: number) {
    // Check if bookmark exists
    const existingBookmark = await this.prisma.bookmark.findFirst({
      where: {
        userId,
        postId,
        type: BookmarkType.POST,
      },
    });

    if (existingBookmark) {
      // Remove bookmark
      await this.prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      return { message: 'Bookmark removed', bookmarked: false };
    } else {
      // Add bookmark
      await this.prisma.bookmark.create({
        data: {
          userId,
          postId,
          type: BookmarkType.POST,
        },
      });
      return { message: 'Post bookmarked', bookmarked: true };
    }
  }

  // AI-powered post generation
  async generatePostWithAI(generateDto: AIGeneratePostDto, authorId: number) {
    // Generate content using AI with specified provider
    const aiContent = await this.aiService.generatePost(
      generateDto.prompt,
      generateDto.provider,
      generateDto.mood,
    );

    // Create the post with AI-generated content
    const createPostDto: CreatePostDto = {
      content: aiContent.content,
      type: generateDto.type,
      isPublic: generateDto.isPublic !== undefined ? generateDto.isPublic : true,
      isPublished: generateDto.publishNow || false,
      scheduledFor: generateDto.scheduledFor,
      isAI: true,
      aiPrompt: generateDto.prompt,
    };

    return this.create(createPostDto, authorId);
  }
}
