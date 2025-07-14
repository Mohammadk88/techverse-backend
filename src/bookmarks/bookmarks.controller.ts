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
import { CreateBookmarkDto, BookmarkFilterDto, BookmarkType } from './dto/bookmark.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('bookmarks')
@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bookmark' })
  @ApiResponse({ status: 201, description: 'Bookmark created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid bookmark data' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already bookmarked' })
  async createBookmark(
    @Body() createBookmarkDto: CreateBookmarkDto,
    @Request() req,
  ) {
    return this.bookmarksService.createBookmark(req.user.userId, createBookmarkDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user bookmarks with pagination' })
  @ApiResponse({ status: 200, description: 'Bookmarks retrieved successfully' })
  async getBookmarks(@Query() filterDto: BookmarkFilterDto, @Request() req) {
    return this.bookmarksService.getBookmarks(req.user.userId, filterDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get bookmark statistics' })
  @ApiResponse({ status: 200, description: 'Bookmark stats retrieved successfully' })
  async getBookmarkStats(@Request() req) {
    return this.bookmarksService.getBookmarkStats(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bookmark by ID' })
  @ApiResponse({ status: 200, description: 'Bookmark retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  async getBookmark(@Param('id') id: string, @Request() req) {
    return this.bookmarksService.getBookmarkById(+id, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete bookmark by ID' })
  @ApiResponse({ status: 200, description: 'Bookmark deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  async deleteBookmark(@Param('id') id: string, @Request() req) {
    return this.bookmarksService.deleteBookmark(+id, req.user.userId);
  }

  @Delete('article/:articleId')
  @ApiOperation({ summary: 'Remove article bookmark' })
  @ApiResponse({ status: 200, description: 'Article bookmark removed successfully' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  async removeArticleBookmark(@Param('articleId') articleId: string, @Request() req) {
    return this.bookmarksService.removeBookmarkByResource(
      req.user.userId,
      BookmarkType.ARTICLE,
      +articleId,
    );
  }

  @Delete('post/:postId')
  @ApiOperation({ summary: 'Remove post bookmark' })
  @ApiResponse({ status: 200, description: 'Post bookmark removed successfully' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  async removePostBookmark(@Param('postId') postId: string, @Request() req) {
    return this.bookmarksService.removeBookmarkByResource(
      req.user.userId,
      BookmarkType.POST,
      +postId,
    );
  }
}
