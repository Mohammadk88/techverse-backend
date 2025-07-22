import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class ScheduleArticleDto {
  @ApiProperty({
    description: 'تاريخ ووقت النشر المجدول',
    example: '2024-07-20T12:00:00Z',
  })
  @IsDateString()
  publish_at: string;

  @ApiProperty({
    description: 'هل تريد تحسين المقال بالذكاء الاصطناعي قبل النشر؟',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  aiEnhanced?: boolean;
}

export class CreateScheduledPostResponseDto {
  @ApiProperty({ description: 'معرف المنشور المجدول' })
  id: number;

  @ApiProperty({ description: 'معرف المقال' })
  article_id: number;

  @ApiProperty({ description: 'تاريخ النشر المجدول' })
  publish_at: string;

  @ApiProperty({ description: 'هل محسن بالذكاء الاصطناعي' })
  aiEnhanced: boolean;

  @ApiProperty({ description: 'حالة المنشور المجدول' })
  status: string;

  @ApiProperty({ description: 'تاريخ الإنشاء' })
  created_at: string;
}
