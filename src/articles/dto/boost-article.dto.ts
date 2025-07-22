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
  start_date: string;

  @ApiProperty({
    description: 'تاريخ نهاية التعزيز',
    example: '2024-07-24T23:59:59Z',
  })
  @IsDateString()
  end_date: string;
}

export class ArticleBoostResponseDto {
  @ApiProperty({ description: 'معرف التعزيز' })
  id: number;

  @ApiProperty({ description: 'معرف المقال' })
  article_id: number;

  @ApiProperty({ description: 'مقدار TechCoin المنفق' })
  coinSpent: number;

  @ApiProperty({ description: 'تاريخ بداية التعزيز' })
  start_date: string;

  @ApiProperty({ description: 'تاريخ نهاية التعزيز' })
  end_date: string;

  @ApiProperty({ description: 'تاريخ الإنشاء' })
  created_at: string;

  @ApiProperty({ description: 'معلومات المقال' })
  article: {
    id: number;
    title: string;
    slug: string;
  };
}
