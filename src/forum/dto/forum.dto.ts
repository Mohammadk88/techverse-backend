import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateForumDto {
  @ApiProperty({ description: 'Forum title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Forum description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Forum icon URL', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Forum color', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Is forum public', default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;

  @ApiProperty({ description: 'Forum rules', required: false })
  @IsOptional()
  @IsString()
  rules?: string;

  @ApiProperty({ description: 'Forum tags', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] = [];

  @ApiPropertyOptional({
    description: 'Language code for the forum (ISO 639-1)',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  languageCode?: string;

  @ApiPropertyOptional({
    description: 'Country code for the forum (ISO 3166-1 alpha-2)',
    example: 'US',
  })
  @IsOptional()
  @IsString()
  countryCode?: string;
}

export class UpdateForumDto extends PartialType(CreateForumDto) {}

export class ForumFilterDto {
  @ApiPropertyOptional({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Show popular forums only',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  popular?: boolean;

  @ApiPropertyOptional({
    description: 'Show featured forums only',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featured?: boolean;

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
