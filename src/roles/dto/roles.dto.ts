import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateGlobalRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: 'ADMIN',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Role description',
    example: 'System administrator with full access',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateCafeRoleDto {
  @ApiProperty({
    description: 'Café role name',
    example: 'MODERATOR',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Café role description',
    example: 'Café moderator with content management privileges',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class AssignGlobalRoleDto {
  @ApiProperty({
    description: 'Global role ID to assign',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  roleId: number;
}

export class AssignCafeRoleDto {
  @ApiProperty({
    description: 'User ID to assign role to',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Café role ID to assign',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  roleId: number;
}
