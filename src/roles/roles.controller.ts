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
    @Param('id', ParseIntPipe) userId: number,
    @Body() assignRoleDto: AssignGlobalRoleDto,
  ) {
    return this.rolesService.assignGlobalRole(userId, assignRoleDto.roleId);
  }

  @Delete('user/:id/remove-global-role/:roleId')
  @ApiOperation({ summary: 'Remove global role from user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'roleId', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Global role removed successfully' })
  @Roles(UserRole.BARISTA)
  async removeGlobalRole(
    @Param('id', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.rolesService.removeGlobalRole(userId, roleId);
  }

  @Post('cafe/:cafeId/assign-role')
  @ApiOperation({ summary: 'Assign café role to user' })
  @ApiParam({ name: 'cafeId', description: 'Café ID' })
  @ApiBody({ type: AssignCafeRoleDto })
  @ApiResponse({ status: 201, description: 'Café role assigned successfully' })
  @Roles(UserRole.BARISTA)
  async assignCafeRole(
    @Param('cafeId', ParseIntPipe) cafeId: number,
    @Body() assignRoleDto: AssignCafeRoleDto,
  ) {
    return this.rolesService.assignCafeRole(
      assignRoleDto.userId,
      cafeId,
      assignRoleDto.roleId,
    );
  }

  @Delete('cafe/:cafeId/remove-role/:userId/:roleId')
  @ApiOperation({ summary: 'Remove café role from user' })
  @ApiParam({ name: 'cafeId', description: 'Café ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'roleId', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Café role removed successfully' })
  @Roles(UserRole.BARISTA)
  async removeCafeRole(
    @Param('cafeId', ParseIntPipe) cafeId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.rolesService.removeCafeRole(userId, cafeId, roleId);
  }

  @Get('user/:id/global')
  @ApiOperation({ summary: 'Get user global roles' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User global roles' })
  @Roles(UserRole.BARISTA)
  async getUserGlobalRoles(@Param('id', ParseIntPipe) userId: number) {
    return this.rolesService.getUserGlobalRoles(userId);
  }

  @Get('user/:id/cafe')
  @ApiOperation({ summary: 'Get all user café roles' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User café roles' })
  @Roles(UserRole.BARISTA)
  async getAllUserCafeRoles(@Param('id', ParseIntPipe) userId: number) {
    return this.rolesService.getUserCafeRoles(userId);
  }

  @Get('user/:id/cafe/:cafeId')
  @ApiOperation({ summary: 'Get user café roles for specific café' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'cafeId', description: 'Café ID' })
  @ApiResponse({ status: 200, description: 'User café roles for specific café' })
  @Roles(UserRole.BARISTA)
  async getUserCafeRoles(
    @Param('id', ParseIntPipe) userId: number,
    @Param('cafeId', ParseIntPipe) cafeId: number,
  ) {
    return this.rolesService.getUserCafeRoles(userId, cafeId);
  }
}
