import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';

export class EarnTechCoinDto {
  @ApiProperty({
    description: 'Amount of TechCoin earned',
    example: 25,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Description of how the TechCoin was earned',
    example: 'Completed task: Fix login bug',
    maxLength: 255,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'XP points to award along with TechCoin',
    example: 10,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  xpReward?: number = 0;

  @ApiProperty({
    description: 'Reference ID for the earning activity',
    example: 456,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  referenceId?: number;

  @ApiProperty({
    description: 'Category of earning activity',
    example: 'task_completion',
    enum: ['task_completion', 'challenge_win', 'bonus_reward', 'other'],
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;
}
