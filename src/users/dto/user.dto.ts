import { IsOptional, IsString, IsEnum, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UserRole } from '../../common/decorators/roles.decorator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Username',
    example: 'johndoe',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'User bio',
    example: 'Tech enthusiast and developer',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'User country ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  countryId?: number;

  @ApiPropertyOptional({
    description: 'User language ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  languageId?: number;
}

export class UpdateUserRoleDto {
  @ApiPropertyOptional({
    description: 'User role',
    enum: UserRole,
    example: UserRole.THINKER,
  })
  @IsEnum(UserRole)
  role: UserRole;
}

export class UserResponseDto {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  role: string;
  xp: number;
  countryId?: number;
  languageId?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
