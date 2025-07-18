import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SearchResponse, SearchResultItem, SearchOptions } from './search.types';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchAll(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    const {
      limit = 20,
      offset = 0,
      includeInactive = false,
      sortBy = 'relevance',
      sortOrder = 'desc',
    } = options;

    // البحث في المقالات
    const articles = await this.searchArticles(query, limit, offset, includeInactive);
    
    // البحث في المقاهي
    const cafes = await this.searchCafes(query, limit, offset, includeInactive);
    
    // البحث في المستخدمين
    const users = await this.searchUsers(query, limit, offset, includeInactive);
    
    // البحث في العلامات
    const tags = await this.searchTags(query, limit, offset);

    const totalResults = articles.length + cafes.length + users.length + tags.length;

    return {
      query,
      totalResults,
      results: {
        articles,
        cafes,
        users,
        tags,
      },
      summary: {
        articlesCount: articles.length,
        cafesCount: cafes.length,
        usersCount: users.length,
        tagsCount: tags.length,
      },
    };
  }

  private async searchArticles(
    query: string,
    limit: number,
    offset: number,
    includeInactive: boolean,
  ): Promise<SearchResultItem[]> {
    const whereCondition: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
        { 
          tags: {
            some: {
              tag: {
                name: { contains: query, mode: 'insensitive' },
              },
            },
          },
        },
        {
          category: {
            name: { contains: query, mode: 'insensitive' },
          },
        },
      ],
    };

    if (!includeInactive) {
      whereCondition.isPublished = true;
    }

    const articles = await this.prisma.article.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
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
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            reactions: true,
            bookmarks: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      description: article.excerpt || article.content?.substring(0, 200) + '...',
      type: 'article' as const,
      avatar: article.featuredImage,
      author: {
        id: article.author.id,
        firstName: article.author.firstName,
        lastName: article.author.lastName,
        username: article.author.username,
      },
      metadata: {
        category: article.category.name,
        tags: article.tags.map((t) => t.tag.name),
        featured: article.featured,
        reactionsCount: article._count.reactions,
        bookmarksCount: article._count.bookmarks,
        languageCode: article.languageCode,
        countryCode: article.countryCode,
        isAI: article.isAI,
      },
      createdAt: article.createdAt,
    }));
  }

  private async searchCafes(
    query: string,
    limit: number,
    offset: number,
    includeInactive: boolean,
  ): Promise<SearchResultItem[]> {
    const whereCondition: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { 
          owner: {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { username: { contains: query, mode: 'insensitive' } },
            ],
          },
        },
      ],
    };

    const cafes = await this.prisma.cafe.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
          },
        },
        country: {
          select: {
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    return cafes.map((cafe) => ({
      id: cafe.id,
      title: cafe.name,
      description: cafe.description,
      type: 'cafe' as const,
      avatar: cafe.coverImage,
      author: {
        id: cafe.owner.id,
        firstName: cafe.owner.firstName,
        lastName: cafe.owner.lastName,
        username: cafe.owner.username,
      },
      metadata: {
        country: cafe.country?.name,
        membersCount: cafe._count.members,
        postsCount: cafe._count.posts,
        isPrivate: cafe.isPrivate,
      },
      createdAt: cafe.createdAt,
    }));
  }

  private async searchUsers(
    query: string,
    limit: number,
    offset: number,
    includeInactive: boolean,
  ): Promise<SearchResultItem[]> {
    const whereCondition: any = {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { username: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (!includeInactive) {
      whereCondition.isActive = true;
    }

    const users = await this.prisma.user.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        xp: true,
        techCoin: true,
        country: {
          select: {
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            articles: true,
            ownedCafes: true,
          },
        },
        createdAt: true,
      },
      orderBy: [
        { xp: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return users.map((user) => ({
      id: user.id,
      title: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'مستخدم',
      description: user.bio,
      type: 'user' as const,
      avatar: user.avatar,
      author: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      },
      metadata: {
        role: user.role,
        xp: user.xp,
        techCoin: user.techCoin,
        country: user.country?.name,
        articlesCount: user._count.articles,
        cafesCount: user._count.ownedCafes,
      },
      createdAt: user.createdAt,
    }));
  }

  private async searchTags(
    query: string,
    limit: number,
    offset: number,
  ): Promise<SearchResultItem[]> {
    const tags = await this.prisma.articleTag.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: [
        { articles: { _count: 'desc' } },
        { name: 'asc' },
      ],
    });

    return tags.map((tag) => ({
      id: tag.id,
      title: tag.name,
      description: `علامة تحتوي على ${tag._count.articles} مقال`,
      type: 'tag' as const,
      metadata: {
        articlesCount: tag._count.articles,
      },
      createdAt: tag.createdAt,
    }));
  }

  // البحث المخصص لكل قسم على حدة
  async searchArticlesOnly(query: string, options: SearchOptions = {}): Promise<SearchResultItem[]> {
    const { limit = 20, offset = 0, includeInactive = false } = options;
    return this.searchArticles(query, limit, offset, includeInactive);
  }

  async searchCafesOnly(query: string, options: SearchOptions = {}): Promise<SearchResultItem[]> {
    const { limit = 20, offset = 0, includeInactive = false } = options;
    return this.searchCafes(query, limit, offset, includeInactive);
  }

  async searchUsersOnly(query: string, options: SearchOptions = {}): Promise<SearchResultItem[]> {
    const { limit = 20, offset = 0, includeInactive = false } = options;
    return this.searchUsers(query, limit, offset, includeInactive);
  }

  async searchTagsOnly(query: string, options: SearchOptions = {}): Promise<SearchResultItem[]> {
    const { limit = 20, offset = 0 } = options;
    return this.searchTags(query, limit, offset);
  }

  async getSearchSuggestions(query: string, limit: number = 5) {
    const suggestions: Array<{
      text: string;
      type: string;
      count: number;
    }> = [];

    // Get article title suggestions
    const articles = await this.prisma.article.findMany({
      where: {
        title: { contains: query, mode: 'insensitive' },
        isPublished: true,
      },
      select: { title: true },
      take: limit,
    });

    articles.forEach((article) => {
      suggestions.push({
        text: article.title,
        type: 'article',
        count: 1,
      });
    });

    // Get tag suggestions
    const tags = await this.prisma.articleTag.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      select: {
        name: true,
        _count: { select: { articles: true } },
      },
      take: limit,
    });

    tags.forEach((tag) => {
      suggestions.push({
        text: tag.name,
        type: 'tag',
        count: tag._count.articles,
      });
    });

    // Get cafe name suggestions
    const cafes = await this.prisma.cafe.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      select: { name: true },
      take: limit,
    });

    cafes.forEach((cafe) => {
      suggestions.push({
        text: cafe.name,
        type: 'cafe',
        count: 1,
      });
    });

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter(
        (suggestion, index, self) =>
          index === self.findIndex((s) => s.text === suggestion.text),
      )
      .slice(0, limit);

    return {
      suggestions: uniqueSuggestions,
    };
  }
}
