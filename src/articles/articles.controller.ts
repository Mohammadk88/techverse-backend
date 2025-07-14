import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiQuery,
} from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import {
  CreateArticleDto,
  UpdateArticleDto,
  ArticleFilterDto,
  CreateCategoryDto,
  CreateTagDto,
  AIGenerateArticleDto,
} from './dto/article.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AIService } from '../ai/ai.service';

@ApiTags('Articles')
@ApiSecurity('X-HTTP-TOKEN')
@UseGuards(JwtAuthGuard)
@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly aiService: AIService,
  ) {}

  @ApiOperation({ summary: 'Create new article (Journalists/Baristas only)' })
  @ApiResponse({
    status: 201,
    description: 'Article created successfully',
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.JOURNALIST, UserRole.BARISTA)
  @Post()
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.articlesService.create(createArticleDto, user.id);
  }

  @ApiOperation({ summary: 'Get all articles (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Articles retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'tagId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiQuery({ name: 'thisWeek', required: false, type: Boolean })
  @ApiQuery({ name: 'languageCode', required: false, type: String })
  @ApiQuery({ name: 'countryCode', required: false, type: String })
  @Public()
  @Get()
  async findAll(
    @Query() filterDto: ArticleFilterDto,
  ) {
    const { page, limit, ...filters } = filterDto;
    const paginationDto = { page, limit };
    return this.articlesService.findAll(paginationDto, filters);
  }

  @ApiOperation({ summary: 'Get article by ID' })
  @ApiResponse({
    status: 200,
    description: 'Article retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.findOne(id);
  }

  @ApiOperation({ summary: 'Get article by slug (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Article retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @Public()
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @ApiOperation({ summary: 'Update article (Author only)' })
  @ApiResponse({
    status: 200,
    description: 'Article updated successfully',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.articlesService.update(id, updateArticleDto, user.id);
  }

  @ApiOperation({ summary: 'Delete article (Author/Barista only)' })
  @ApiResponse({
    status: 200,
    description: 'Article deleted successfully',
  })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: UserRole },
  ) {
    return this.articlesService.remove(id, user.id, user.role);
  }

  // Category endpoints
  @ApiOperation({ summary: 'Create new category (Baristas only)' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.BARISTA)
  @Post('categories')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.articlesService.createCategory(createCategoryDto);
  }

  @ApiOperation({ summary: 'Get all categories (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  @Public()
  @Get('categories/all')
  async findAllCategories() {
    return this.articlesService.findAllCategories();
  }

  // Tag endpoints
  @ApiOperation({ summary: 'Create new tag (Baristas only)' })
  @ApiResponse({
    status: 201,
    description: 'Tag created successfully',
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.BARISTA)
  @Post('tags')
  async createTag(@Body() createTagDto: CreateTagDto) {
    return this.articlesService.createTag(createTagDto);
  }

  @ApiOperation({ summary: 'Get all tags (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Tags retrieved successfully',
  })
  @Public()
  @Get('tags/all')
  async findAllTags() {
    return this.articlesService.findAllTags();
  }

  // AI Generation endpoints
  @ApiOperation({ summary: 'Generate article using AI (Journalists/Baristas only)' })
  @ApiResponse({
    status: 201,
    description: 'AI article generated and created successfully',
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.JOURNALIST, UserRole.BARISTA, UserRole.MEMBER) // Added MEMBER for testing
  @Post('ai/generate')
  async generateArticleWithAI(
    @Body() generateDto: AIGenerateArticleDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.articlesService.generateArticleWithAI(generateDto, user.id);
  }

  @ApiOperation({ summary: 'Get AI content suggestions' })
  @ApiResponse({
    status: 200,
    description: 'AI content suggestions retrieved successfully',
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.JOURNALIST, UserRole.BARISTA, UserRole.THINKER)
  @Get('ai/suggestions')
  async getContentSuggestions(@Query('category') category?: string) {
    return {
      suggestions: await this.aiService.generateContentSuggestions('article', category),
    };
  }
}
