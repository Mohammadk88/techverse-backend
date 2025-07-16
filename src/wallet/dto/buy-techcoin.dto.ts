import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Min, IsOptional, IsString } from 'class-validator';

export class BuyTechCoinDto {
  @ApiProperty({
    description: 'Amount of TechCoin to purchase',
    example: 100,
    minimum: 1,
    maximum: 10000,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Payment method (mock for demo)',
    example: 'stripe',
    required: false,
    default: 'stripe',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string = 'stripe';
}
