import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { reaction_types } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateReactionDto {
  @ApiProperty({
    enum: reaction_types,
    description: 'Type of reaction',
    example: reaction_types.LIKE,
  })
  @IsEnum(reaction_types)
  type: reaction_types;

  @ApiPropertyOptional({
    description: 'Article ID (for article reactions)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  article_id?: number;

  @ApiPropertyOptional({
    description: 'Project ID (for project reactions)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  project_id?: number;

  @ApiPropertyOptional({
    description: 'Challenge ID (for challenge reactions)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  challengeId?: number;

  @ApiPropertyOptional({
    description: 'Cafe Post ID (for cafe post reactions)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cafePostId?: number;
}

export class ReactionStatsDto {
  @ApiProperty({
    description: 'Total number of reactions',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Breakdown of reactions by type',
    example: {
      LIKE: 10,
      LOVE: 5,
      LAUGH: 3,
      WOW: 4,
      SAD: 2,
      ANGRY: 1,
    },
  })
  breakdown: Record<reaction_types, number>;

  @ApiPropertyOptional({
    enum: reaction_types,
    description: 'Current user reaction (if authenticated)',
    example: reaction_types.LIKE,
  })
  userReaction?: reaction_types;
}

export class UserDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiPropertyOptional({ description: 'Username', example: 'john_doe' })
  username?: string | null;

  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  first_name?: string | null;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  last_name?: string | null;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  avatar?: string | null;
}

export class ReactionResponseDto {
  @ApiProperty({ description: 'Reaction ID', example: 1 })
  id: number;

  @ApiProperty({
    enum: reaction_types,
    description: 'Type of reaction',
    example: reaction_types.LIKE,
  })
  type: reaction_types;

  @ApiProperty({ description: 'User ID who made the reaction', example: 1 })
  user_id: number;

  @ApiPropertyOptional({
    type: UserDto,
    description: 'User information (when included)',
  })
  user?: UserDto;

  @ApiProperty({
    description: 'Reaction creation date',
    example: '2024-07-16T21:58:59.000Z',
  })
  created_at: Date;
}
