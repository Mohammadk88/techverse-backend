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

  async createBookmark(user_id: number, createBookmarkDto: CreateBookmarkDto) {
    const { article_id } = createBookmarkDto;

    // Validate that the article exists
    const article = await this.prisma.article_tags.findUnique({
      where: { id: article_id },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if bookmark already exists
    const existingBookmark = await this.prisma.bookmarks.findUnique({
      where: { 
        user_id_article_id: {
          user_id,
          article_id
        }
      },
    });

    if (existingBookmark) {
      throw new ConflictException('Article already bookmarked');
    }

    // Create bookmark
    return await this.prisma.bookmarks.create({
      data: {
        user_id,
        article_id,
      },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            featured_image: true,
            published_at: true,
            users: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            article_categories: {
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

  async getBookmarks(user_id: number, filterDto: BookmarkFilterDto) {
    const { page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      this.prisma.bookmarks.findMany({
        where: { user_id },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          articles: {
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              featured_image: true,
              published_at: true,
              users: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
              article_categories: {
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
      this.prisma.bookmarks.count({ where: { user_id } }),
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

  async getBookmarkById(id: number, user_id: number) {
    const bookmark = await this.prisma.bookmarks.findFirst({
      where: {
        id,
        user_id,
      },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            featured_image: true,
            published_at: true,
            users: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            article_categories: {
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

  async deleteBookmark(id: number, user_id: number) {
    const bookmark = await this.prisma.bookmarks.findFirst({
      where: {
        id,
        user_id,
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.prisma.bookmarks.delete({
      where: { id },
    });

    return { message: 'Bookmark deleted successfully' };
  }

  async removeArticleBookmark(user_id: number, article_id: number) {
    const bookmark = await this.prisma.bookmarks.findUnique({
      where: {
        user_id_article_id: {
          user_id,
          article_id,
        },
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.prisma.bookmarks.delete({
      where: { id: bookmark.id },
    });

    return { message: 'Article bookmark removed successfully' };
  }

  async getBookmarkStats(user_id: number) {
    const totalBookmarks = await this.prisma.bookmarks.count({
      where: { user_id },
    });

    return {
      total: totalBookmarks,
      articles: totalBookmarks, // Only articles now
    };
  }
}
