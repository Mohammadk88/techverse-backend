import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateBookmarkDto, BookmarkFilterDto, BookmarkType } from './dto/bookmark.dto';

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  async createBookmark(userId: number, createBookmarkDto: CreateBookmarkDto) {
    const { type, articleId, postId } = createBookmarkDto;

    // Validate that correct ID is provided based on type
    if (type === BookmarkType.ARTICLE && !articleId) {
      throw new BadRequestException('Article ID is required for ARTICLE bookmarks');
    }

    if (type === BookmarkType.POST && !postId) {
      throw new BadRequestException('Post ID is required for POST bookmarks');
    }

    // Validate that the resource exists
    if (type === BookmarkType.ARTICLE) {
      const article = await this.prisma.article.findUnique({
        where: { id: articleId },
      });
      if (!article) {
        throw new NotFoundException('Article not found');
      }

      // Check if bookmark already exists
      const existingBookmark = await this.prisma.bookmark.findFirst({
        where: {
          userId,
          type: 'ARTICLE',
          articleId,
        },
      });

      if (existingBookmark) {
        throw new ConflictException('Article is already bookmarked');
      }
    }

    if (type === BookmarkType.POST) {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if bookmark already exists
      const existingBookmark = await this.prisma.bookmark.findFirst({
        where: {
          userId,
          type: 'POST',
          postId,
        },
      });

      if (existingBookmark) {
        throw new ConflictException('Post is already bookmarked');
      }
    }

    return await this.prisma.bookmark.create({
      data: {
        type,
        userId,
        articleId: type === BookmarkType.ARTICLE ? articleId : null,
        postId: type === BookmarkType.POST ? postId : null,
      },
      include: {
        article: type === BookmarkType.ARTICLE ? {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            featuredImage: true,
            publishedAt: true,
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        } : false,
        post: type === BookmarkType.POST ? {
          select: {
            id: true,
            content: true,
            type: true,
            mediaUrl: true,
            linkUrl: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        } : false,
      },
    });
  }

  async getBookmarks(userId: number, filterDto: BookmarkFilterDto) {
    const { page = 1, limit = 10, type } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (type) {
      where.type = type;
    }

    const [bookmarks, total] = await Promise.all([
      this.prisma.bookmark.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              featuredImage: true,
              publishedAt: true,
              author: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          post: {
            select: {
              id: true,
              content: true,
              type: true,
              mediaUrl: true,
              linkUrl: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.bookmark.count({ where }),
    ]);

    return {
      bookmarks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBookmarkById(id: number, userId: number) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            featuredImage: true,
            publishedAt: true,
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            type: true,
            mediaUrl: true,
            linkUrl: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    return bookmark;
  }

  async deleteBookmark(id: number, userId: number) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.prisma.bookmark.delete({
      where: { id },
    });

    return { message: 'Bookmark deleted successfully' };
  }

  async removeBookmarkByResource(
    userId: number,
    type: BookmarkType,
    resourceId: number,
  ) {
    const where: any = {
      userId,
      type,
    };

    if (type === BookmarkType.ARTICLE) {
      where.articleId = resourceId;
    } else {
      where.postId = resourceId;
    }

    const bookmark = await this.prisma.bookmark.findFirst({
      where,
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.prisma.bookmark.delete({
      where: { id: bookmark.id },
    });

    return { message: 'Bookmark removed successfully' };
  }

  async getBookmarkStats(userId: number) {
    const [totalBookmarks, articleBookmarks, postBookmarks] = await Promise.all([
      this.prisma.bookmark.count({
        where: { userId },
      }),
      this.prisma.bookmark.count({
        where: {
          userId,
          type: 'ARTICLE',
        },
      }),
      this.prisma.bookmark.count({
        where: {
          userId,
          type: 'POST',
        },
      }),
    ]);

    return {
      total: totalBookmarks,
      articles: articleBookmarks,
      posts: postBookmarks,
    };
  }
}
