import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { user_roles } from '@prisma/client';
import {
  AssignGlobalRoleDto,
  AssignCafeRoleDto,
  CreateGlobalRoleDto,
  CreateCafeRoleDto,
} from './dto/roles.dto';

@ApiTags('🛡️ Roles')
@ApiSecurity('X-HTTP-TOKEN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('global')
  @ApiOperation({ summary: 'Get all global roles' })
  @ApiResponse({ status: 200, description: 'List of global roles' })
  @Roles(UserRole.BARISTA)
  async getGlobalRoles() {
    return this.rolesService.getGlobalRoles();
  }

  @Post('global')
  @ApiOperation({ summary: 'Create a new global role' })
  @ApiResponse({ status: 201, description: 'Global role created successfully' })
  @ApiBody({ type: CreateGlobalRoleDto })
  @Roles(UserRole.BARISTA)
  async createGlobalRole(@Body() createGlobalRoleDto: CreateGlobalRoleDto) {
    return this.rolesService.createGlobalRole(
      createGlobalRoleDto.name,
      createGlobalRoleDto.description,
    );
  }

  @Get('cafe')
  @ApiOperation({ summary: 'Get all café roles' })
  @ApiResponse({ status: 200, description: 'List of café roles' })
  @Roles(UserRole.BARISTA)
  async getCafeRoles() {
    return this.rolesService.getCafeRoles();
  }

  @Post('cafe')
  @ApiOperation({ summary: 'Create a new café role' })
  @ApiResponse({ status: 201, description: 'Café role created successfully' })
  @ApiBody({ type: CreateCafeRoleDto })
  @Roles(UserRole.BARISTA)
  async createCafeRole(@Body() createCafeRoleDto: CreateCafeRoleDto) {
    return this.rolesService.createCafeRole(
      createCafeRoleDto.name,
      createCafeRoleDto.description,
    );
  }

  @Post('user/:id/assign-global-role')
  @ApiOperation({ summary: 'Assign global role to user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: AssignGlobalRoleDto })
  @ApiResponse({ status: 201, description: 'Global role assigned successfully' })
  @Roles(UserRole.BARISTA)
  async assignGlobalRole(
    @Param('id', ParseIntPipe) user_id: number,
    @Body() assignRoleDto: AssignGlobalRoleDto,
  ) {
    return this.rolesService.assignGlobalRole(user_id, assignRoleDto.role_id);
  }

  @Delete('user/:id/remove-global-role/:role_id')
  @ApiOperation({ summary: 'Remove global role from user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'role_id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Global role removed successfully' })
  @Roles(UserRole.BARISTA)
  async removeGlobalRole(
    @Param('id', ParseIntPipe) user_id: number,
    @Param('role_id', ParseIntPipe) role_id: number,
  ) {
    return this.rolesService.removeGlobalRole(user_id, role_id);
  }

  @Post('cafe/:cafe_id/assign-role')
  @ApiOperation({ summary: 'Assign café role to user' })
  @ApiParam({ name: 'cafe_id', description: 'Café ID' })
  @ApiBody({ type: AssignCafeRoleDto })
  @ApiResponse({ status: 201, description: 'Café role assigned successfully' })
  @Roles(UserRole.BARISTA)
  async assignCafeRole(
    @Param('cafe_id', ParseIntPipe) cafe_id: number,
    @Body() assignRoleDto: AssignCafeRoleDto,
  ) {
    return this.rolesService.assignCafeRole(
      assignRoleDto.user_id,
      cafe_id,
      assignRoleDto.role_id,
    );
  }

  @Delete('cafe/:cafe_id/remove-role/:user_id/:role_id')
  @ApiOperation({ summary: 'Remove café role from user' })
  @ApiParam({ name: 'cafe_id', description: 'Café ID' })
  @ApiParam({ name: 'user_id', description: 'User ID' })
  @ApiParam({ name: 'role_id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Café role removed successfully' })
  @Roles(UserRole.BARISTA)
  async removeCafeRole(
    @Param('cafe_id', ParseIntPipe) cafe_id: number,
    @Param('user_id', ParseIntPipe) user_id: number,
    @Param('role_id', ParseIntPipe) role_id: number,
  ) {
    return this.rolesService.removeCafeRole(user_id, cafe_id, role_id);
  }

  @Get('user/:id/global')
  @ApiOperation({ summary: 'Get user global roles' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User global roles' })
  @Roles(UserRole.BARISTA)
  async getUserGlobalRoles(@Param('id', ParseIntPipe) user_id: number) {
    return this.rolesService.getUserGlobalRoles(user_id);
  }

  @Get('user/:id/cafe')
  @ApiOperation({ summary: 'Get all user café roles' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User café roles' })
  @Roles(UserRole.BARISTA)
  async getAllUserCafeRoles(@Param('id', ParseIntPipe) user_id: number) {
    return this.rolesService.getUserCafeRoles(user_id);
  }

  @Get('user/:id/cafe/:cafe_id')
  @ApiOperation({ summary: 'Get user café roles for specific café' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'cafe_id', description: 'Café ID' })
  @ApiResponse({ status: 200, description: 'User café roles for specific café' })
  @Roles(UserRole.BARISTA)
  async getUserCafeRoles(
    @Param('id', ParseIntPipe) user_id: number,
    @Param('cafe_id', ParseIntPipe) cafe_id: number,
  ) {
    return this.rolesService.getUserCafeRoles(user_id, cafe_id);
  }
}
