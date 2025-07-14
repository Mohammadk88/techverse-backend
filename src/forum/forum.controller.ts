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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ForumService } from './forum.service';
import {
  CreateForumDto,
  UpdateForumDto,
  ForumFilterDto,
} from './dto/forum.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('forums')
@Controller('forums')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new forum' })
  @ApiResponse({ status: 201, description: 'Forum created successfully' })
  async create(@Body() createForumDto: CreateForumDto, @Request() req) {
    return this.forumService.createForum(req.user.userId, createForumDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all forums with pagination' })
  @ApiResponse({ status: 200, description: 'Forums retrieved successfully' })
  async findAll(@Query() filterDto: ForumFilterDto) {
    return this.forumService.getForums(filterDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get forum by ID' })
  @ApiResponse({ status: 200, description: 'Forum retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Forum not found' })
  async findOne(@Param('id') id: string) {
    return this.forumService.getForumById(+id);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get forum by slug' })
  @ApiResponse({ status: 200, description: 'Forum retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Forum not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.forumService.getForumBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update forum' })
  @ApiResponse({ status: 200, description: 'Forum updated successfully' })
  @ApiResponse({ status: 404, description: 'Forum not found' })
  @ApiResponse({ status: 403, description: 'Only forum creator can update' })
  async update(
    @Param('id') id: string,
    @Body() updateForumDto: UpdateForumDto,
    @Request() req,
  ) {
    return this.forumService.updateForum(+id, req.user.userId, updateForumDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete forum' })
  @ApiResponse({ status: 200, description: 'Forum deleted successfully' })
  @ApiResponse({ status: 404, description: 'Forum not found' })
  @ApiResponse({ status: 403, description: 'Only forum creator can delete' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.forumService.deleteForum(+id, req.user.userId);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a forum' })
  @ApiResponse({ status: 201, description: 'Successfully joined forum' })
  @ApiResponse({ status: 404, description: 'Forum not found' })
  @ApiResponse({ status: 403, description: 'Already a member' })
  async joinForum(@Param('id') id: string, @Request() req) {
    return this.forumService.joinForum(+id, req.user.userId);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Leave a forum' })
  @ApiResponse({ status: 200, description: 'Successfully left forum' })
  @ApiResponse({ status: 404, description: 'Not a member of this forum' })
  async leaveForum(@Param('id') id: string, @Request() req) {
    return this.forumService.leaveForum(+id, req.user.userId);
  }
}
