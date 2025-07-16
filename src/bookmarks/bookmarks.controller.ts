import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto, BookmarkFilterDto } from './dto/bookmark.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('🔖 Bookmarks (Articles Only)')
@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Bookmark an article',
    description: 'Add an article to user bookmarks for easy access later'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Article bookmarked successfully',
    schema: {
      example: {
        id: 15,
        userId: 123,
        articleId: 45,
        createdAt: '2025-07-16T12:00:00Z',
        article: {
          id: 45,
          title: 'Complete Guide to React Hooks',
          slug: 'complete-guide-react-hooks',
          excerpt: 'Learn everything about React Hooks...',
          featuredImage: 'https://example.com/image.jpg',
          publishedAt: '2025-07-15T10:00:00Z',
          author: {
            id: 67,
            username: 'johndoe',
            avatar: null
          },
          category: {
            id: 3,
            name: 'Programming',
            slug: 'programming'
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 409, description: 'Article already bookmarked' })
  async createBookmark(
    @Body() createBookmarkDto: CreateBookmarkDto,
    @Request() req,
  ) {
    return this.bookmarksService.createBookmark(req.user.id, createBookmarkDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get user bookmarks',
    description: 'Retrieve all bookmarked articles with pagination'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Bookmarks retrieved successfully',
    schema: {
      example: {
        bookmarks: [
          {
            id: 15,
            userId: 123,
            articleId: 45,
            createdAt: '2025-07-16T12:00:00Z',
            article: {
              id: 45,
              title: 'Complete Guide to React Hooks',
              slug: 'complete-guide-react-hooks',
              excerpt: 'Learn everything about React Hooks...'
            }
          }
        ],
        pagination: {
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3
        }
      }
    }
  })
  async getBookmarks(@Query() filterDto: BookmarkFilterDto, @Request() req) {
    return this.bookmarksService.getBookmarks(req.user.id, filterDto);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get bookmark statistics',
    description: 'Get total count of bookmarked articles'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Bookmark stats retrieved successfully',
    schema: {
      example: {
        total: 25,
        articles: 25
      }
    }
  })
  async getBookmarkStats(@Request() req) {
    return this.bookmarksService.getBookmarkStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get bookmark by ID',
    description: 'Retrieve specific bookmark details by ID'
  })
  @ApiResponse({ status: 200, description: 'Bookmark retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  async getBookmark(@Param('id') id: string, @Request() req) {
    return this.bookmarksService.getBookmarkById(+id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete bookmark by ID',
    description: 'Remove bookmark from user collection'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Bookmark deleted successfully',
    schema: {
      example: {
        message: 'Bookmark deleted successfully'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  async deleteBookmark(@Param('id') id: string, @Request() req) {
    return this.bookmarksService.deleteBookmark(+id, req.user.id);
  }

  @Delete('article/:articleId')
  @ApiOperation({ 
    summary: 'Remove article bookmark',
    description: 'Remove specific article from bookmarks by article ID'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Article bookmark removed successfully',
    schema: {
      example: {
        message: 'Article bookmark removed successfully'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  async removeArticleBookmark(@Param('articleId') articleId: string, @Request() req) {
    return this.bookmarksService.removeArticleBookmark(req.user.id, +articleId);
  }
}
