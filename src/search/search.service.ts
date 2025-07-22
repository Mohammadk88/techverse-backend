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
          article_categories: {
            name: { contains: query, mode: 'insensitive' },
          },
        },
      ],
    };

    if (!includeInactive) {
      whereCondition.is_published = true;
    }

    const articles = await this.prisma.articles.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
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
        article_categories: {
          select: {
            id: true,
            name: true,
          },
        },
        article_tag_relations: {
          include: {
            article_tags: {
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
        { created_at: 'desc' },
      ],
    });

    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      description: article.excerpt || article.content?.substring(0, 200) + '...',
      type: 'article' as const,
      avatar: article.featured_image,
      author: {
        id: article.users.id,
        first_name: article.users.first_name,
        last_name: article.users.last_name,
        username: article.users.username,
      },
      metadata: {
        article_categories: article.article_categories.name,
        tags: article.article_tag_relations.map((t) => t.article_tags.name),
        featured: article.featured,
        reactionsCount: article._count.reactions,
        bookmarksCount: article._count.bookmarks,
        language_code: article.language_code,
        country_code: article.country_code,
        is_ai: article.is_ai,
      },
      created_at: article.created_at,
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
              { first_name: { contains: query, mode: 'insensitive' } },
              { last_name: { contains: query, mode: 'insensitive' } },
              { username: { contains: query, mode: 'insensitive' } },
            ],
          },
        },
      ],
    };

    const cafes = await this.prisma.cafes.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
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
        countries: {
          select: {
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            cafe_members: true,
            cafe_posts: true,
          },
        },
      },
      orderBy: [
        { created_at: 'desc' },
      ],
    });

    return cafes.map((cafe) => ({
      id: cafe.id,
      title: cafe.name,
      description: cafe.description,
      type: 'cafe' as const,
      avatar: cafe.cover_image,
      author: {
        id: cafe.users.id,
        first_name: cafe.users.first_name,
        last_name: cafe.users.last_name,
        username: cafe.users.username,
      },
      metadata: {
        countries: cafe.countries?.name,
        membersCount: cafe._count.cafe_members,
        postsCount: cafe._count.cafe_posts,
        is_private: cafe.is_private,
      },
      created_at: cafe.created_at,
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
        { first_name: { contains: query, mode: 'insensitive' } },
        { last_name: { contains: query, mode: 'insensitive' } },
        { username: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (!includeInactive) {
      whereCondition.is_active = true;
    }

    const users = await this.prisma.users.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        username: true,
        avatar: true,
        bio: true,
        user_global_roles: true,
        xp: true,
        tech_coin: true,
        countries: {
          select: {
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            articles: true,
            cafes: true,
          },
        },
        created_at: true,
      },
      orderBy: [
        { xp: 'desc' },
        { created_at: 'desc' },
      ],
    });

    return users.map((user) => ({
      id: user.id,
      title: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'مستخدم',
      description: user.bio,
      type: 'user' as const,
      avatar: user.avatar,
      author: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
      },
      metadata: {
        role: user.user_global_roles,
        xp: user.xp,
        tech_coin: user.tech_coin,
        countries: user.countries?.name,
        articlesCount: user._count.articles,
        cafesCount: user._count.cafes,
      },
      created_at: user.created_at,
    }));
  }

  private async searchTags(
    query: string,
    limit: number,
    offset: number,
  ): Promise<SearchResultItem[]> {
    const tags = await this.prisma.article_tags.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: {
            article_tag_relations: true,
          },
        },
      },
      orderBy: [
        { article_tag_relations: { _count: 'desc' } },
        { name: 'asc' },
      ],
    });

    return tags.map((tag) => ({
      id: tag.id,
      title: tag.name,
      description: `علامة تحتوي على ${tag._count.article_tag_relations} مقال`,
      type: 'tag' as const,
      metadata: {
        articlesCount: tag._count.article_tag_relations,
      },
      created_at: tag.created_at,
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
    const articles = await this.prisma.articles.findMany({
      where: {
        title: { contains: query, mode: 'insensitive' },
        is_published: true,
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
    const tags = await this.prisma.article_tags.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      select: {
        name: true,
        _count: { select: { article_tag_relations: true } },
      },
      take: limit,
    });

    tags.forEach((tag) => {
      suggestions.push({
        text: tag.name,
        type: 'tag',
        count: tag._count.article_tag_relations,
      });
    });

    // Get cafe name suggestions
    const cafes = await this.prisma.cafes.findMany({
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
