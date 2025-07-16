import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class JoinChallengeDto {
  @ApiProperty({
    description: 'Optional message or approach description when joining',
    example: 'I plan to use React with TypeScript and implement real-time features using Socket.io',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @ApiProperty({
    description: 'GitHub or portfolio URL (optional)',
    example: 'https://github.com/username',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  portfolioUrl?: string;
}
