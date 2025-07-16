import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';

export class SpendTechCoinDto {
  @ApiProperty({
    description: 'Amount of TechCoin to spend',
    example: 50,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Description of the spending transaction',
    example: 'Join challenge: Code Master',
    maxLength: 255,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Reference ID for the transaction (challenge ID, cafe ID, etc.)',
    example: 123,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  referenceId?: number;

  @ApiProperty({
    description: 'Type of spending activity',
    example: 'challenge_entry',
    enum: ['challenge_entry', 'cafe_creation', 'task_escrow', 'other'],
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;
}
