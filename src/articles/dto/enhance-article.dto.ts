import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum AIEnhancementType {
  TITLE_OPTIMIZATION = 'TITLE_OPTIMIZATION',
  SUMMARY_GENERATION = 'SUMMARY_GENERATION',
  SEO_TAGS = 'SEO_TAGS',
  FULL_ENHANCEMENT = 'FULL_ENHANCEMENT',
}

export class EnhanceArticleDto {
  @ApiProperty({
    description: 'نوع التحسين المطلوب',
    enum: AIEnhancementType,
    example: AIEnhancementType.TITLE_OPTIMIZATION,
  })
  @IsEnum(AIEnhancementType)
  enhancementType: AIEnhancementType;
}

export class ApplyEnhancementDto {
  @ApiProperty({
    description: 'معرف التحسين المراد تطبيقه',
    example: 1,
  })
  @IsNotEmpty()
  enhancementId: number;
}

export class ArticleAIEnhancementResponseDto {
  @ApiProperty({ description: 'معرف التحسين' })
  id: number;

  @ApiProperty({ description: 'معرف المقال' })
  article_id: number;

  @ApiProperty({ description: 'نوع التحسين' })
  enhancementType: string;

  @ApiProperty({ description: 'القيمة الأصلية' })
  originalValue: string;

  @ApiProperty({ description: 'القيمة المحسنة' })
  enhancedValue: string;

  @ApiProperty({ description: 'TechCoin المنفق' })
  coinSpent: number;

  @ApiProperty({ description: 'هل تم تطبيق التحسين' })
  isApplied: boolean;

  @ApiProperty({ description: 'تاريخ الإنشاء' })
  created_at: string;
}
