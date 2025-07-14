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
import { PodcastService } from './podcast.service';
import {
  CreatePlaylistDto,
  UpdatePlaylistDto,
  PlaylistFilterDto,
  CreateEpisodeDto,
  UpdateEpisodeDto,
  EpisodeFilterDto,
  CreateEpisodeCommentDto,
  UpdateEpisodeCommentDto,
} from './dto/podcast.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('podcasts')
@Controller('podcasts')
export class PodcastController {
  constructor(private readonly podcastService: PodcastService) {}

  // Playlist Endpoints
  @Post('playlists')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new playlist' })
  @ApiResponse({ status: 201, description: 'Playlist created successfully' })
  async createPlaylist(@Body() createPlaylistDto: CreatePlaylistDto) {
    return this.podcastService.createPlaylist(createPlaylistDto);
  }

  @Get('playlists')
  @Public()
  @ApiOperation({ summary: 'Get all playlists with pagination' })
  @ApiResponse({ status: 200, description: 'Playlists retrieved successfully' })
  async getPlaylists(@Query() filterDto: PlaylistFilterDto) {
    return this.podcastService.getPlaylists(filterDto);
  }

  @Get('playlists/:id')
  @Public()
  @ApiOperation({ summary: 'Get playlist by ID with episodes' })
  @ApiResponse({ status: 200, description: 'Playlist retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Playlist not found' })
  async getPlaylist(@Param('id') id: string) {
    return this.podcastService.getPlaylistById(+id);
  }

  @Patch('playlists/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update playlist' })
  @ApiResponse({ status: 200, description: 'Playlist updated successfully' })
  @ApiResponse({ status: 404, description: 'Playlist not found' })
  async updatePlaylist(
    @Param('id') id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
  ) {
    return this.podcastService.updatePlaylist(+id, updatePlaylistDto);
  }

  @Delete('playlists/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete playlist' })
  @ApiResponse({ status: 200, description: 'Playlist deleted successfully' })
  @ApiResponse({ status: 404, description: 'Playlist not found' })
  async deletePlaylist(@Param('id') id: string) {
    return this.podcastService.deletePlaylist(+id);
  }

  // Episode Endpoints
  @Post('episodes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new episode' })
  @ApiResponse({ status: 201, description: 'Episode created successfully' })
  @ApiResponse({ status: 404, description: 'Playlist not found' })
  async createEpisode(@Body() createEpisodeDto: CreateEpisodeDto) {
    return this.podcastService.createEpisode(createEpisodeDto);
  }

  @Get('episodes')
  @Public()
  @ApiOperation({ summary: 'Get all episodes with pagination' })
  @ApiResponse({ status: 200, description: 'Episodes retrieved successfully' })
  async getEpisodes(@Query() filterDto: EpisodeFilterDto) {
    return this.podcastService.getEpisodes(filterDto);
  }

  @Get('episodes/:id')
  @Public()
  @ApiOperation({ summary: 'Get episode by ID' })
  @ApiResponse({ status: 200, description: 'Episode retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  async getEpisode(@Param('id') id: string) {
    return this.podcastService.getEpisodeById(+id);
  }

  @Patch('episodes/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update episode' })
  @ApiResponse({ status: 200, description: 'Episode updated successfully' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  async updateEpisode(
    @Param('id') id: string,
    @Body() updateEpisodeDto: UpdateEpisodeDto,
  ) {
    return this.podcastService.updateEpisode(+id, updateEpisodeDto);
  }

  @Delete('episodes/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete episode' })
  @ApiResponse({ status: 200, description: 'Episode deleted successfully' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  async deleteEpisode(@Param('id') id: string) {
    return this.podcastService.deleteEpisode(+id);
  }

  // Episode Interaction Endpoints
  @Post('episodes/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like/unlike an episode' })
  @ApiResponse({ status: 200, description: 'Episode like toggled successfully' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  async likeEpisode(@Param('id') id: string, @Request() req) {
    return this.podcastService.likeEpisode(+id, req.user.userId);
  }

  @Get('episodes/:id/comments')
  @Public()
  @ApiOperation({ summary: 'Get episode comments' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  async getEpisodeComments(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.podcastService.getEpisodeComments(
      +id,
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }

  @Post('episodes/:id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment to episode' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  async createEpisodeComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateEpisodeCommentDto,
    @Request() req,
  ) {
    return this.podcastService.createEpisodeComment(
      +id,
      req.user.userId,
      createCommentDto,
    );
  }

  @Patch('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update episode comment' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 403, description: 'Can only edit own comments' })
  async updateEpisodeComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateEpisodeCommentDto,
    @Request() req,
  ) {
    return this.podcastService.updateEpisodeComment(
      +id,
      req.user.userId,
      updateCommentDto,
    );
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete episode comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 403, description: 'Can only delete own comments' })
  async deleteEpisodeComment(@Param('id') id: string, @Request() req) {
    return this.podcastService.deleteEpisodeComment(+id, req.user.userId);
  }
}
