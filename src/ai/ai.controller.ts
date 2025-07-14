import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIService } from './ai.service';
import { AIProvider } from '../common/enums/ai-provider.enum';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Get('providers')
  @ApiOperation({ summary: 'Get available AI providers and their status' })
  @ApiResponse({
    status: 200,
    description: 'List of available AI providers with their configuration status',
  })
  getProviders() {
    return this.aiService.getAvailableProviders();
  }

  @Get('providers/enum')
  @ApiOperation({ summary: 'Get AI provider enum values' })
  @ApiResponse({
    status: 200,
    description: 'All possible AI provider values',
  })
  getProviderEnum() {
    return {
      providers: Object.values(AIProvider),
      default: AIProvider.OPENAI,
    };
  }
}
