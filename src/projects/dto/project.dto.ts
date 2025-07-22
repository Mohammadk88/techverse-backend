import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum ProjectStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  DONE = 'DONE',
}

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project title',
    example: 'E-commerce Website Development',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Need a full-stack e-commerce website with React and Node.js',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Is project public',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean = true;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({
    description: 'Project status',
    enum: ProjectStatus,
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Setup authentication system',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Implement JWT authentication with user registration and login',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Task price in TechCoin',
    example: 50,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  price: number;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({
    description: 'Task status',
    enum: TaskStatus,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}

export class ApplyToTaskDto {
  @ApiProperty({
    description: 'Application message',
    example:
      'I have 3 years of experience with JWT authentication. I can complete this task within 2 days.',
  })
  @IsString()
  message: string;
}

export class ProjectFilterDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by project status',
    enum: ProjectStatus,
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({
    description: 'Search by title or description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Show only public projects',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_public?: boolean = true;
}

export class TaskFilterDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by task status',
    enum: TaskStatus,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Search by title or description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by price range - minimum',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter by price range - maximum',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;
}
