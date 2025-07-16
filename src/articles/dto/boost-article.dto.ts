import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsDateString, Min } from 'class-validator';

export class BoostArticleDto {
  @ApiProperty({
    description: 'مقدار TechCoin المراد إنفاقه على التعزيز',
    example: 50,
    minimum: 10,
  })
  @IsInt()
  @Min(10, { message: 'الحد الأدنى للتعزيز هو 10 TechCoin' })
  coinSpent: number;

  @ApiProperty({
    description: 'تاريخ بداية التعزيز',
    example: '2024-07-17T00:00:00Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'تاريخ نهاية التعزيز',
    example: '2024-07-24T23:59:59Z',
  })
  @IsDateString()
  endDate: string;
}

export class ArticleBoostResponseDto {
  @ApiProperty({ description: 'معرف التعزيز' })
  id: number;

  @ApiProperty({ description: 'معرف المقال' })
  articleId: number;

  @ApiProperty({ description: 'مقدار TechCoin المنفق' })
  coinSpent: number;

  @ApiProperty({ description: 'تاريخ بداية التعزيز' })
  startDate: string;

  @ApiProperty({ description: 'تاريخ نهاية التعزيز' })
  endDate: string;

  @ApiProperty({ description: 'تاريخ الإنشاء' })
  createdAt: string;

  @ApiProperty({ description: 'معلومات المقال' })
  article: {
    id: number;
    title: string;
    slug: string;
  };
}
