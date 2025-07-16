import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
  IsPositive,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ChallengeType } from '@prisma/client';

export class CreateChallengeDto {
  @ApiProperty({
    description: 'Challenge title',
    example: 'Code Master Challenge',
    minLength: 5,
    maxLength: 100,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Detailed challenge description and requirements',
    example:
      'Build a responsive web application using React and Node.js. Must include user authentication, CRUD operations, and responsive design.',
    minLength: 20,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  description: string;

  @ApiProperty({
    description: 'TechCoin reward for the winner',
    example: 100,
    minimum: 10,
    maximum: 10000,
  })
  @IsNumber()
  @IsPositive()
  @Min(10)
  reward: number;

  @ApiProperty({
    description: 'TechCoin entry fee required to participate',
    example: 25,
    minimum: 5,
    maximum: 1000,
  })
  @IsNumber()
  @IsPositive()
  @Min(5)
  entryFee: number;

  @ApiProperty({
    description: 'How the winner will be determined',
    enum: ChallengeType,
    example: ChallengeType.VOTE,
    enumName: 'ChallengeType',
  })
  @IsEnum(ChallengeType)
  type: ChallengeType;

  @ApiProperty({
    description: 'Challenge start date and time (ISO 8601)',
    example: '2025-07-20T00:00:00Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Challenge end date and time (ISO 8601)',
    example: '2025-07-27T23:59:59Z',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Additional requirements or rules',
    example: 'Code must be submitted via GitHub repository link',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  requirements?: string;

  @ApiProperty({
    description: 'Tags for challenge categorization',
    example: ['javascript', 'react', 'nodejs', 'fullstack'],
    required: false,
    type: [String],
  })
  @IsOptional()
  tags?: string[];
}
