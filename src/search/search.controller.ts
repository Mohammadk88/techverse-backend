import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchResponse, SearchOptions } from './search.types';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'البحث الشامل - Global Search',
    description:
      'بحث شامل في جميع المحتويات (مقالات، كافيهات، مستخدمين، وسوم) / Search across all content types',
  })
  @ApiQuery({
    name: 'q',
    description: 'مصطلح البحث / Search query',
    example: 'javascript',
  })
  @ApiQuery({
    name: 'page',
    description: 'رقم الصفحة / Page number',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'عدد النتائج في الصفحة / Results per page',
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: 'category',
    description: 'فئة المقالات للبحث / Article category filter',
    required: false,
  })
  @ApiQuery({
    name: 'author',
    description: 'مؤلف المقال / Article author filter',
    required: false,
  })
  @ApiQuery({
    name: 'tag',
    description: 'وسم للبحث / Tag filter',
    required: false,
  })
  @ApiQuery({
    name: 'city',
    description: 'مدينة الكافيه / Cafe city filter',
    required: false,
  })
  @ApiQuery({
    name: 'language',
    description: 'لغة المحتوى / Content language filter',
    required: false,
    example: 'ar',
  })
  @ApiResponse({
    status: 200,
    description: 'نتائج البحث الشامل / Global search results',
  })
  async searchAll(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('author') author?: string,
    @Query('tag') tag?: string,
    @Query('city') city?: string,
    @Query('language') language?: string,
  ): Promise<SearchResponse> {
    const options: SearchOptions = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      category,
      author,
      tag,
      city,
      language,
    };

    return this.searchService.searchAll(query, options);
  }

    @Get('articles')
  @Public()
  @ApiOperation({
    summary: 'البحث في المقالات فقط - Search Articles Only',
    description:
      'بحث محدد في المقالات فقط / Search specifically in articles only',
  })
  @ApiQuery({
    name: 'q',
    description: 'مصطلح البحث / Search query',
    example: 'react',
  })
  @ApiQuery({
    name: 'page',
    description: 'رقم الصفحة / Page number',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'عدد النتائج في الصفحة / Results per page',
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: 'category',
    description: 'فئة المقالات / Article category',
    required: false,
  })
  @ApiQuery({
    name: 'author',
    description: 'مؤلف المقال / Article author',
    required: false,
  })
  @ApiQuery({
    name: 'language',
    description: 'لغة المحتوى / Content language',
    required: false,
    example: 'ar',
  })
  @ApiResponse({
    status: 200,
    description: 'نتائج البحث في المقالات / Article search results',
  })
  async searchArticles(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('author') author?: string,
    @Query('language') language?: string,
  ) {
    const options: SearchOptions = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      category,
      author,
      language,
    };

    return this.searchService.searchArticlesOnly(query, options);
  }

  @Get('cafes')
  @Public()
  @ApiOperation({
    summary: 'البحث في الكافيهات فقط - Search Cafes Only',
    description:
      'بحث محدد في الكافيهات فقط / Search specifically in cafes only',
  })
  @ApiQuery({
    name: 'q',
    description: 'مصطلح البحث / Search query',
    example: 'tech',
  })
  @ApiQuery({
    name: 'page',
    description: 'رقم الصفحة / Page number',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'عدد النتائج في الصفحة / Results per page',
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: 'city',
    description: 'مدينة الكافيه / Cafe city',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'نتائج البحث في الكافيهات / Cafe search results',
  })
  async searchCafes(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('city') city?: string,
  ) {
    const options: SearchOptions = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      city,
    };

    return this.searchService.searchCafesOnly(query, options);
  }

    @Get('users')
  @Public()
  @ApiOperation({
    summary: 'البحث في المستخدمين فقط - Search Users Only',
    description:
      'بحث محدد في المستخدمين فقط / Search specifically in users only',
  })
  @ApiQuery({
    name: 'q',
    description: 'مصطلح البحث / Search query',
    example: 'أحمد',
  })
  @ApiQuery({
    name: 'page',
    description: 'رقم الصفحة / Page number',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'عدد النتائج في الصفحة / Results per page',
    required: false,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'نتائج البحث في المستخدمين / User search results',
  })
  async searchUsers(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const options: SearchOptions = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    };

    return this.searchService.searchUsersOnly(query, options);
  }

  @Get('tags')
  @Public()
  @ApiOperation({
    summary: 'البحث في الوسوم فقط - Search Tags Only',
    description: 'بحث محدد في الوسوم فقط / Search specifically in tags only',
  })
  @ApiQuery({
    name: 'q',
    description: 'مصطلح البحث / Search query',
    example: 'javascript',
  })
  @ApiQuery({
    name: 'page',
    description: 'رقم الصفحة / Page number',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'عدد النتائج في الصفحة / Results per page',
    required: false,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'نتائج البحث في الوسوم / Tag search results',
  })
  async searchTags(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const options: SearchOptions = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    };

    return this.searchService.searchTagsOnly(query, options);
  }

  @Get('suggestions')
  @Public()
  @ApiOperation({
    summary: 'اقتراحات البحث - Search Suggestions',
    description:
      'الحصول على اقتراحات بناءً على استعلام البحث / Get search suggestions based on query',
  })
  @ApiQuery({
    name: 'q',
    description: 'بداية مصطلح البحث / Partial search query',
    example: 'java',
  })
  @ApiQuery({
    name: 'limit',
    description: 'عدد الاقتراحات / Number of suggestions',
    required: false,
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'اقتراحات البحث / Search suggestions',
  })
  async getSearchSuggestions(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    return this.searchService.getSearchSuggestions(
      query,
      limit ? parseInt(limit) : 5,
    );
  }
}
