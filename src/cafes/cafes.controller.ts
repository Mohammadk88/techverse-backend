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
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CafesService } from './cafes.service';
import { Public } from '../common/decorators/public.decorator';
import { CreateCafeDto, UpdateCafeDto, CreateCafePostDto, UpdateCafePostDto, CafeFilterDto } from './dto/cafe.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cafés')
@ApiBearerAuth()
@Controller('cafes')
@UseGuards(JwtAuthGuard)
export class CafesController {
  constructor(private readonly cafesService: CafesService) {}

  // Cafe Management
  @Post()
  async create(@Body() createCafeDto: CreateCafeDto, @Request() req) {
    return this.cafesService.create(createCafeDto, req.user.userId);
  }

  @Get()
  @Public()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isPrivate', required: false, type: Boolean })
  @ApiQuery({ name: 'popular', required: false, type: Boolean })
  @ApiQuery({ name: 'languageCode', required: false, type: String })
  @ApiQuery({ name: 'countryCode', required: false, type: String })
  async findAll(@Query() filterDto: CafeFilterDto) {
    const { page, limit, ...filters } = filterDto;
    const paginationDto = { page, limit };
    return this.cafesService.findAll(paginationDto, filters);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cafesService.findOne(id);
  }

  @Get('slug/:slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    return this.cafesService.findBySlug(slug);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCafeDto: UpdateCafeDto,
    @Request() req,
  ) {
    return this.cafesService.update(id, updateCafeDto, req.user);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.cafesService.remove(id, req.user);
  }

  // Member Management
  @Post(':id/join')
  async joinCafe(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.cafesService.joinCafe(id, req.user.userId);
  }

  @Post(':id/leave')
  async leaveCafe(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.cafesService.leaveCafe(id, req.user.userId);
  }

  // Cafe Posts Management
  @Post(':id/posts')
  async createPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCafePostDto: CreateCafePostDto,
    @Request() req,
  ) {
    return this.cafesService.createPost(id, createCafePostDto, req.user.userId);
  }

  @Get(':id/posts')
  @Public()
  async getCafePosts(
    @Param('id', ParseIntPipe) id: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.cafesService.getCafePosts(id, paginationDto);
  }

  @Patch('posts/:postId')
  async updateCafePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() updateCafePostDto: UpdateCafePostDto,
    @Request() req,
  ) {
    return this.cafesService.updateCafePost(postId, updateCafePostDto, req.user);
  }

  @Delete('posts/:postId')
  async deleteCafePost(@Param('postId', ParseIntPipe) postId: number, @Request() req) {
    return this.cafesService.deleteCafePost(postId, req.user);
  }
}
