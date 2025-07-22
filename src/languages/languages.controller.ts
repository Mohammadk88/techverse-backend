import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LanguagesService } from './languages.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('🌍 Languages')
@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all supported languages' })
  @ApiResponse({
    status: 200,
    description: 'List of supported UI languages',
    example: [
      {
        id: 1,
        name: 'English',
        native_name: 'English',
        code: 'en',
        direction: 'ltr',
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      },
    ],
  })
  findAll() {
    return this.languagesService.findAll();
  }
}
