import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import {
  CreatePostDto,
  UpdatePostDto,
  PostFilterDto,
  AIGeneratePostDto,
} from './dto/post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AIService } from '../ai/ai.service';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly aiService: AIService,
  ) {}

  @Post()
  async create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user.userId);
  }

  @Get()
  @Public()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'cafeId', required: false, type: Number })
  @ApiQuery({ name: 'tagId', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['TEXT', 'IMAGE', 'VIDEO', 'LINK'] })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiQuery({ name: 'trending', required: false, type: Boolean })
  @ApiQuery({ name: 'languageCode', required: false, type: String })
  @ApiQuery({ name: 'countryCode', required: false, type: String })
  async findAll(@Query() filterDto: PostFilterDto) {
    const { page, limit, ...filters } = filterDto;
    const paginationDto = { page, limit };
    return this.postsService.findAll(paginationDto, filters);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    return this.postsService.update(id, updatePostDto, req.user);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.postsService.remove(id, req.user);
  }

  @Post(':id/bookmark')
  async toggleBookmark(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.postsService.toggleBookmark(id, req.user.userId);
  }

  // AI Generation endpoints
  @ApiOperation({ summary: 'Generate post using AI (All authenticated users)' })
  @ApiResponse({
    status: 201,
    description: 'AI post generated and created successfully',
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.MEMBER, UserRole.THINKER, UserRole.JOURNALIST, UserRole.BARISTA)
  @Post('ai-generate')
  async generatePostWithAI(
    @Body() generateDto: AIGeneratePostDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.postsService.generatePostWithAI(generateDto, user.id);
  }

  @ApiOperation({ summary: 'Get AI content suggestions for posts' })
  @ApiResponse({
    status: 200,
    description: 'AI content suggestions retrieved successfully',
  })
  @Get('ai/suggestions')
  async getContentSuggestions() {
    return {
      suggestions: await this.aiService.generateContentSuggestions('post'),
    };
  }
}
