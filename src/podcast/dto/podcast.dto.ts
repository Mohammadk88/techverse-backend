import { IsString, IsOptional, IsBoolean, IsUrl, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

// Playlist DTOs
export class CreatePlaylistDto {
  @ApiProperty({
    description: 'Playlist title',
    example: 'TechVerse Daily Talks',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Playlist description',
    example: 'Daily technology discussions and insights',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Playlist cover image URL',
    example: 'https://example.com/cover.jpg',
  })
  @IsUrl()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({
    description: 'Whether the playlist is public',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdatePlaylistDto {
  @ApiPropertyOptional({
    description: 'Playlist title',
    example: 'Updated Playlist Title',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Playlist description',
    example: 'Updated description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Playlist cover image URL',
    example: 'https://example.com/new-cover.jpg',
  })
  @IsUrl()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({
    description: 'Whether the playlist is public',
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class PlaylistFilterDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
    minimum: 1,
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search term for playlist title or description',
    example: 'tech',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by public/private status',
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

// Episode DTOs
export class CreateEpisodeDto {
  @ApiProperty({
    description: 'Episode title',
    example: 'Introduction to React Hooks',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Episode description',
    example: 'A comprehensive guide to React Hooks and their usage',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Video URL for the episode',
    example: 'https://youtube.com/watch?v=abc123',
  })
  @IsUrl()
  videoUrl: string;

  @ApiPropertyOptional({
    description: 'Episode thumbnail URL',
    example: 'https://example.com/thumbnail.jpg',
  })
  @IsUrl()
  @IsOptional()
  thumbnail?: string;

  @ApiPropertyOptional({
    description: 'Episode duration in seconds',
    example: 1800,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @ApiProperty({
    description: 'Playlist ID',
    example: 1,
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  playlistId: number;

  @ApiPropertyOptional({
    description: 'Order index within the playlist',
    default: 0,
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;

  @ApiPropertyOptional({
    description: 'Whether the episode is published',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class UpdateEpisodeDto {
  @ApiPropertyOptional({
    description: 'Episode title',
    example: 'Updated Episode Title',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Episode description',
    example: 'Updated description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Video URL for the episode',
    example: 'https://youtube.com/watch?v=updated123',
  })
  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({
    description: 'Episode thumbnail URL',
    example: 'https://example.com/new-thumbnail.jpg',
  })
  @IsUrl()
  @IsOptional()
  thumbnail?: string;

  @ApiPropertyOptional({
    description: 'Episode duration in seconds',
    example: 2100,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({
    description: 'Order index within the playlist',
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;

  @ApiPropertyOptional({
    description: 'Whether the episode is published',
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class EpisodeFilterDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
    minimum: 1,
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search term for episode title or description',
    example: 'react',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by published status',
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by playlist ID',
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  playlistId?: number;
}

// Comment DTOs
export class CreateEpisodeCommentDto {
  @ApiProperty({
    description: 'Comment content',
    example: 'Great episode! Very informative.',
  })
  @IsString()
  content: string;
}

export class UpdateEpisodeCommentDto {
  @ApiProperty({
    description: 'Updated comment content',
    example: 'Updated comment text',
  })
  @IsString()
  content: string;
}
