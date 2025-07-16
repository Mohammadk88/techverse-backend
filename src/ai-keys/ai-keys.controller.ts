import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnhancedRolesGuard } from '../auth/guards/enhanced-roles.guard';
import {
  GlobalRoles,
  GLOBAL_ROLES,
} from '../auth/decorators/enhanced-roles.decorator';
import { AIKeysService } from './ai-keys.service';
import {
  CreateAIKeyDto,
  UpdateAIKeyDto,
  AIKeyResponseDto,
  AIProviderResponseDto,
} from './dto/ai-key.dto';

@ApiTags('🤖 AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIKeysController {
  constructor(private readonly aiKeysService: AIKeysService) {}

  @Get('providers')
  @ApiOperation({ summary: 'Get all AI providers' })
  @ApiResponse({
    status: 200,
    description: 'List of AI providers',
    type: [AIProviderResponseDto],
  })
  async getProviders() {
    return this.aiKeysService.getProviders();
  }

  @Get('keys')
  @ApiOperation({ summary: 'Get user AI keys' })
  @ApiResponse({
    status: 200,
    description: 'List of user AI keys',
    type: [AIKeyResponseDto],
  })
  async getUserKeys(@Req() req: any) {
    return this.aiKeysService.getUserKeys(req.user.id);
  }

  @Post('keys')
  @ApiOperation({ summary: 'Create new AI key' })
  @ApiResponse({
    status: 201,
    description: 'AI key created successfully',
    type: AIKeyResponseDto,
  })
  async createUserKey(@Req() req: any, @Body() createKeyDto: CreateAIKeyDto) {
    return this.aiKeysService.createUserKey(req.user.id, createKeyDto);
  }

  @Put('keys/:id')
  @ApiOperation({ summary: 'Update AI key' })
  @ApiParam({ name: 'id', description: 'AI key ID' })
  @ApiResponse({
    status: 200,
    description: 'AI key updated successfully',
    type: AIKeyResponseDto,
  })
  async updateUserKey(
    @Req() req: any,
    @Param('id', ParseIntPipe) keyId: number,
    @Body() updateKeyDto: UpdateAIKeyDto,
  ) {
    return this.aiKeysService.updateUserKey(req.user.id, keyId, updateKeyDto);
  }

  @Delete('keys/:id')
  @ApiOperation({ summary: 'Delete AI key' })
  @ApiParam({ name: 'id', description: 'AI key ID' })
  @ApiResponse({
    status: 200,
    description: 'AI key deleted successfully',
  })
  async deleteUserKey(
    @Req() req: any,
    @Param('id', ParseIntPipe) keyId: number,
  ) {
    return this.aiKeysService.deleteUserKey(req.user.id, keyId);
  }

  // Admin endpoints for system keys
  @Get('admin/system-keys')
  @UseGuards(EnhancedRolesGuard)
  @GlobalRoles(GLOBAL_ROLES.ADMIN)
  @ApiOperation({ summary: 'Get all system AI keys (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of system AI keys',
    type: [AIKeyResponseDto],
  })
  async getSystemKeys() {
    return this.aiKeysService.getSystemKeys();
  }

  @Post('admin/system-keys')
  @UseGuards(EnhancedRolesGuard)
  @GlobalRoles(GLOBAL_ROLES.ADMIN)
  @ApiOperation({ summary: 'Create system AI key (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'System AI key created successfully',
    type: AIKeyResponseDto,
  })
  async createSystemKey(@Body() createKeyDto: CreateAIKeyDto) {
    return this.aiKeysService.createSystemKey(createKeyDto);
  }

  @Put('admin/system-keys/:id')
  @UseGuards(EnhancedRolesGuard)
  @GlobalRoles(GLOBAL_ROLES.ADMIN)
  @ApiOperation({ summary: 'Update system AI key (Admin only)' })
  @ApiParam({ name: 'id', description: 'System AI key ID' })
  @ApiResponse({
    status: 200,
    description: 'System AI key updated successfully',
    type: AIKeyResponseDto,
  })
  async updateSystemKey(
    @Param('id', ParseIntPipe) keyId: number,
    @Body() updateKeyDto: UpdateAIKeyDto,
  ) {
    return this.aiKeysService.updateSystemKey(keyId, updateKeyDto);
  }

  @Delete('admin/system-keys/:id')
  @UseGuards(EnhancedRolesGuard)
  @GlobalRoles(GLOBAL_ROLES.ADMIN)
  @ApiOperation({ summary: 'Delete system AI key (Admin only)' })
  @ApiParam({ name: 'id', description: 'System AI key ID' })
  @ApiResponse({
    status: 200,
    description: 'System AI key deleted successfully',
  })
  async deleteSystemKey(@Param('id', ParseIntPipe) keyId: number) {
    return this.aiKeysService.deleteSystemKey(keyId);
  }
}
