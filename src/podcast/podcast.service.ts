import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
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

@Injectable()
export class PodcastService {
  constructor(private prisma: PrismaService) {}

  // Playlist Management
  async createPlaylist(createPlaylistDto: CreatePlaylistDto) {
    return await this.prisma.playlist.create({
      data: {
        title: createPlaylistDto.title,
        description: createPlaylistDto.description,
        coverImage: createPlaylistDto.coverImage,
        isPublic: createPlaylistDto.isPublic ?? true,
      },
      include: {
        _count: {
          select: {
            episodes: true,
          },
        },
      },
    });
  }

  async getPlaylists(filterDto: PlaylistFilterDto) {
    const { page = 1, limit = 10, search, isPublic } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    const [playlists, total] = await Promise.all([
      this.prisma.playlist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              episodes: true,
            },
          },
        },
      }),
      this.prisma.playlist.count({ where }),
    ]);

    return {
      playlists,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPlaylistById(id: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        episodes: {
          orderBy: { orderIndex: 'asc' },
          include: {
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
        _count: {
          select: {
            episodes: true,
          },
        },
      },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    return playlist;
  }

  async updatePlaylist(id: number, updatePlaylistDto: UpdatePlaylistDto) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    return await this.prisma.playlist.update({
      where: { id },
      data: updatePlaylistDto,
      include: {
        _count: {
          select: {
            episodes: true,
          },
        },
      },
    });
  }

  async deletePlaylist(id: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    await this.prisma.playlist.delete({
      where: { id },
    });

    return { message: 'Playlist deleted successfully' };
  }

  // Episode Management
  async createEpisode(createEpisodeDto: CreateEpisodeDto) {
    // Check if playlist exists
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: createEpisodeDto.playlistId },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    return await this.prisma.episode.create({
      data: {
        title: createEpisodeDto.title,
        description: createEpisodeDto.description,
        videoUrl: createEpisodeDto.videoUrl,
        thumbnail: createEpisodeDto.thumbnail,
        duration: createEpisodeDto.duration,
        playlistId: createEpisodeDto.playlistId,
        orderIndex: createEpisodeDto.orderIndex ?? 0,
        isPublished: createEpisodeDto.isPublished ?? true,
      },
      include: {
        playlist: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  async getEpisodes(filterDto: EpisodeFilterDto) {
    const { page = 1, limit = 10, search, isPublished, playlistId } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    if (playlistId) {
      where.playlistId = playlistId;
    }

    const [episodes, total] = await Promise.all([
      this.prisma.episode.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ playlistId: 'asc' }, { orderIndex: 'asc' }],
        include: {
          playlist: {
            select: {
              id: true,
              title: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      this.prisma.episode.count({ where }),
    ]);

    return {
      episodes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEpisodeById(id: number) {
    const episode = await this.prisma.episode.findUnique({
      where: { id },
      include: {
        playlist: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    return episode;
  }

  async updateEpisode(id: number, updateEpisodeDto: UpdateEpisodeDto) {
    const episode = await this.prisma.episode.findUnique({
      where: { id },
    });

    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    return await this.prisma.episode.update({
      where: { id },
      data: updateEpisodeDto,
      include: {
        playlist: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  async deleteEpisode(id: number) {
    const episode = await this.prisma.episode.findUnique({
      where: { id },
    });

    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    await this.prisma.episode.delete({
      where: { id },
    });

    return { message: 'Episode deleted successfully' };
  }

  // Episode Interactions
  async likeEpisode(episodeId: number, userId: number) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
    });

    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    const existingLike = await this.prisma.episodeLike.findUnique({
      where: {
        userId_episodeId: {
          userId,
          episodeId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await this.prisma.episodeLike.delete({
        where: {
          userId_episodeId: {
            userId,
            episodeId,
          },
        },
      });
      return { message: 'Episode unliked successfully', liked: false };
    } else {
      // Like
      await this.prisma.episodeLike.create({
        data: {
          userId,
          episodeId,
        },
      });
      return { message: 'Episode liked successfully', liked: true };
    }
  }

  async getEpisodeComments(episodeId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.episodeComment.findMany({
        where: { episodeId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.episodeComment.count({ where: { episodeId } }),
    ]);

    return {
      comments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createEpisodeComment(
    episodeId: number,
    userId: number,
    createCommentDto: CreateEpisodeCommentDto,
  ) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
    });

    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    return await this.prisma.episodeComment.create({
      data: {
        content: createCommentDto.content,
        userId,
        episodeId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async updateEpisodeComment(
    commentId: number,
    userId: number,
    updateCommentDto: UpdateEpisodeCommentDto,
  ) {
    const comment = await this.prisma.episodeComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return await this.prisma.episodeComment.update({
      where: { id: commentId },
      data: {
        content: updateCommentDto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async deleteEpisodeComment(commentId: number, userId: number) {
    const comment = await this.prisma.episodeComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.episodeComment.delete({
      where: { id: commentId },
    });

    return { message: 'Comment deleted successfully' };
  }
}
