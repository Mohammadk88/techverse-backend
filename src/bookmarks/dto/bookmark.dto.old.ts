import { IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum BookmarkType {
  ARTICLE = 'ARTICLE',
  POST = 'POST',
}

export class CreateBookmarkDto {
  @ApiProperty({
    description: 'Type of bookmark',
    enum: BookmarkType,
    example: BookmarkType.ARTICLE,
  })
  @IsEnum(BookmarkType)
  type: BookmarkType;

  @ApiPropertyOptional({
    description: 'Article ID (required if type is ARTICLE)',
    example: 1,
  })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  @IsInt()
  @Min(1)
  @IsOptional()
  article_id?: number;

  @ApiPropertyOptional({
    description: 'Post ID (required if type is POST)',
    example: 1,
  })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  @IsInt()
  @Min(1)
  @IsOptional()
  postId?: number;
}

export class BookmarkFilterDto {
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
    description: 'Filter by bookmark type',
    enum: BookmarkType,
  })
  @IsEnum(BookmarkType)
  @IsOptional()
  type?: BookmarkType;
}
