import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnhancedRolesGuard } from '../auth/guards/enhanced-roles.guard';
import { GlobalRoles, CafeRoles, GLOBAL_ROLES, CAFE_ROLES } from '../auth/decorators/enhanced-roles.decorator';

@ApiTags('📋 Examples')
@ApiSecurity('X-HTTP-TOKEN')
@UseGuards(JwtAuthGuard, EnhancedRolesGuard)
@Controller('examples')
export class ExamplesController {
  // Global role examples
  @Get('admin-only')
  @ApiOperation({ summary: 'Example endpoint for global admins only' })
  @ApiResponse({ status: 200, description: 'Admin-only content' })
  @GlobalRoles(GLOBAL_ROLES.ADMIN)
  async getAdminOnlyContent() {
    return { message: 'This content is only for global administrators!' };
  }

  @Get('editors-and-admins')
  @ApiOperation({ summary: 'Example endpoint for editors and admins' })
  @ApiResponse({ status: 200, description: 'Editor/Admin content' })
  @GlobalRoles(GLOBAL_ROLES.ADMIN, GLOBAL_ROLES.EDITOR)
  async getEditorContent() {
    return { message: 'This content is for editors and admins!' };
  }

  // Café role examples
  @Get('cafe/:cafe_id/barista-only')
  @ApiOperation({ summary: 'Example endpoint for café baristas only' })
  @ApiParam({ name: 'cafe_id', description: 'Café ID' })
  @ApiResponse({ status: 200, description: 'Barista-only content' })
  @CafeRoles(CAFE_ROLES.BARISTA)
  async getBaristaContent(@Param('cafe_id', ParseIntPipe) cafe_id: number) {
    return { 
      message: `This content is only for baristas of café ${cafe_id}!`,
      cafe_id 
    };
  }

  @Get('cafe/:cafe_id/content-creators')
  @ApiOperation({ summary: 'Example endpoint for café content creators' })
  @ApiParam({ name: 'cafe_id', description: 'Café ID' })
  @ApiResponse({ status: 200, description: 'Content creator access' })
  @CafeRoles(CAFE_ROLES.BARISTA, CAFE_ROLES.THINKER, CAFE_ROLES.JOURNALIST)
  async getContentCreatorAccess(@Param('cafe_id', ParseIntPipe) cafe_id: number) {
    return { 
      message: `This content is for café ${cafe_id} content creators (baristas, thinkers, journalists)!`,
      cafe_id 
    };
  }

  // Mixed role examples - user needs EITHER global OR café role
  @Post('cafe/:cafe_id/moderate')
  @ApiOperation({ summary: 'Example moderation endpoint with mixed roles' })
  @ApiParam({ name: 'cafe_id', description: 'Café ID' })
  @ApiResponse({ status: 200, description: 'Moderation action completed' })
  @GlobalRoles(GLOBAL_ROLES.ADMIN, GLOBAL_ROLES.SUPERVISOR)
  @CafeRoles(CAFE_ROLES.BARISTA)
  async moderateContent(
    @Param('cafe_id', ParseIntPipe) cafe_id: number,
    @Body() moderationData: { action: string; reason: string }
  ) {
    return { 
      message: `Moderation action '${moderationData.action}' performed on café ${cafe_id}`,
      reason: moderationData.reason,
      cafe_id 
    };
  }

  // Public endpoint (no roles required)
  @Get('public')
  @ApiOperation({ summary: 'Example public endpoint (no roles required)' })
  @ApiResponse({ status: 200, description: 'Public content' })
  async getPublicContent() {
    return { message: 'This content is available to all authenticated users!' };
  }
}
