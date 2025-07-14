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
  providerId: number;

  @ApiProperty({
    description: 'The API key secret',
    example: 'sk-...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'API key must be at least 10 characters long' })
  secretKey: string;
}

export class UpdateAIKeyDto {
  @ApiPropertyOptional({
    description: 'Updated API key secret',
    example: 'sk-...',
  })
  @IsString()
  @IsOptional()
  @MinLength(10, { message: 'API key must be at least 10 characters long' })
  secretKey?: string;

  @ApiPropertyOptional({
    description: 'Whether the API key is active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AIKeyResponseDto {
  @ApiProperty({ description: 'API key ID' })
  id: number;

  @ApiProperty({ description: 'Provider ID' })
  providerId: number;

  @ApiProperty({ description: 'Custom key name' })
  keyName: string;

  @ApiProperty({ description: 'Whether key is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

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
  isActive: boolean;

  @ApiProperty({ description: 'Whether this is the default provider' })
  isDefault: boolean;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
