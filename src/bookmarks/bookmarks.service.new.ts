import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateBookmarkDto, BookmarkFilterDto } from './dto/bookmark.dto';

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  async createBookmark(userId: number, createBookmarkDto: CreateBookmarkDto) {
    const { articleId } = createBookmarkDto;

    // Validate that the article exists
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if bookmark already exists
    const existingBookmark = await this.prisma.bookmark.findUnique({
      where: { 
        userId_articleId: {
          userId,
          articleId
        }
      },
    });

    if (existingBookmark) {
      throw new ConflictException('Article already bookmarked');
    }

    // Create bookmark
    return await this.prisma.bookmark.create({
      data: {
        userId,
        articleId,
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
      },
    });
  }

  async getBookmarks(userId: number, filterDto: BookmarkFilterDto) {
    const { page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      this.prisma.bookmark.findMany({
        where: { userId },
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
        },
      }),
      this.prisma.bookmark.count({ where: { userId } }),
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

  async removeArticleBookmark(userId: number, articleId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId
        }
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.prisma.bookmark.delete({
      where: { id: bookmark.id },
    });

    return { message: 'Article bookmark removed successfully' };
  }

  async getBookmarkStats(userId: number) {
    const totalBookmarks = await this.prisma.bookmark.count({
      where: { userId },
    });

    return {
      total: totalBookmarks,
      articles: totalBookmarks, // Only articles now
    };
  }
}
