import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  IsUrl,
  IsInt,
} from 'class-validator';
import { ApiProperty, PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateCafeDto {
  @ApiProperty({
    description: 'Cafe name',
    example: 'JavaScript Developers',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Cafe description',
    example:
      'A community for JavaScript developers to share knowledge and discuss best practices',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Cover image URL',
    example: 'https://example.com/images/javascript-cafe.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @ApiProperty({
    description: 'Whether the cafe is private',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @ApiPropertyOptional({
    description: 'Language code for the cafe (ISO 639-1)',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  languageCode?: string;

  @ApiPropertyOptional({
    description: 'Country code for the cafe (ISO 3166-1 alpha-2)',
    example: 'US',
  })
  @IsOptional()
  @IsString()
  countryCode?: string;
}

export class UpdateCafeDto extends PartialType(CreateCafeDto) {}

export class CreateCafePostDto {
  @ApiProperty({
    description: 'Post content',
    example: 'What are your thoughts on the new JavaScript features in ES2025?',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}

export class UpdateCafePostDto extends PartialType(CreateCafePostDto) {}

export class CafeFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search cafes by name',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by private/public cafes',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPrivate?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by owner ID',
    required: false,
  })
  @IsOptional()
  ownerId?: number;

  @ApiPropertyOptional({
    description: 'Show popular cafes only',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  popular?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by language code (ISO 639-1)',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  languageCode?: string;

  @ApiPropertyOptional({
    description: 'Filter by country code (ISO 3166-1 alpha-2)',
    example: 'US',
  })
  @IsOptional()
  @IsString()
  countryCode?: string;
}
