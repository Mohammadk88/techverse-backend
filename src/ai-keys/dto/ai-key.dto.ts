import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAIKeyDto {
  @ApiProperty({
    description: 'ID of the AI provider',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  provider_id: number;

  @ApiProperty({
    description: 'The API key secret',
    example: 'sk-...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'API key must be at least 10 characters long' })
  secret_key: string;
}

export class UpdateAIKeyDto {
  @ApiPropertyOptional({
    description: 'Updated API key secret',
    example: 'sk-...',
  })
  @IsString()
  @IsOptional()
  @MinLength(10, { message: 'API key must be at least 10 characters long' })
  secret_key?: string;

  @ApiPropertyOptional({
    description: 'Whether the API key is active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class AIKeyResponseDto {
  @ApiProperty({ description: 'API key ID' })
  id: number;

  @ApiProperty({ description: 'Provider ID' })
  provider_id: number;

  @ApiProperty({ description: 'Custom key name' })
  key_name: string;

  @ApiProperty({ description: 'Whether key is active' })
  is_active: boolean;

  @ApiProperty({ description: 'Created timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updated_at: Date;

  @ApiProperty({ description: 'Provider information' })
  provider: {
    id: number;
    name: string;
    label: string;
  };
}

export class AIProviderResponseDto {
  @ApiProperty({ description: 'Provider ID' })
  id: number;

  @ApiProperty({ description: 'Provider name (slug)' })
  name: string;

  @ApiProperty({ description: 'Provider display label' })
  label: string;

  @ApiProperty({ description: 'Whether provider is active' })
  is_active: boolean;

  @ApiProperty({ description: 'Whether this is the default provider' })
  is_default: boolean;

  @ApiProperty({ description: 'Created timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updated_at: Date;
}
