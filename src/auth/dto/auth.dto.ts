import {
  IsEmail,
  IsString,
  MinLength,
  IsInt,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@techverse.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({
    description: 'Country ID',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  country_id: number;

  @ApiProperty({
    description: 'City ID',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  city_id: number;

  @ApiProperty({
    description: 'Language ID for user interface',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  language_id: number;
}

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@techverse.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User information',
  })
  user: {
    id: number;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
    role: string;
    xp: number;
    language?: {
      id: number;
      name: string;
      native_name: string;
      code: string;
      direction: string | null;
    } | null;
    country?: {
      id: number;
      name: string;
      code: string;
    } | null;
    city?: {
      id: number;
      name: string;
    } | null;
  };
}
