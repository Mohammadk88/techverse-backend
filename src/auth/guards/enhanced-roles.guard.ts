import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class EnhancedRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required global roles from decorator
    const requiredGlobalRoles = this.reflector.getAllAndOverride<string[]>(
      'user_global_roles',
      [context.getHandler(), context.getClass()],
    );

    // Get required café roles from decorator
    const requiredCafeRoles = this.reflector.getAllAndOverride<string[]>(
      'cafe_roles',
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredGlobalRoles && !requiredCafeRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Check global roles if required
    if (requiredGlobalRoles && requiredGlobalRoles.length > 0) {
      const hasGlobalRole = await this.checkUserGlobalRoles(
        user.id,
        requiredGlobalRoles,
      );
      if (hasGlobalRole) {
        return true;
      }
    }

    // Check café roles if required
    if (requiredCafeRoles && requiredCafeRoles.length > 0) {
      const cafe_id = this.extractCafeId(request);
      if (cafe_id) {
        const hasCafeRole = await this.checkUserCafeRoles(
          user.id,
          cafe_id,
          requiredCafeRoles,
        );
        if (hasCafeRole) {
          return true;
        }
      }
    }

    return false;
  }

  private async checkUserGlobalRoles(
    user_id: number,
    requiredRoles: string[],
  ): Promise<boolean> {
    const userRoles = await this.prisma.user_global_roles.findMany({
      where: { user_id },
      include: { global_roles: true },
    });

    const userRoleNames = userRoles.map((ur) => ur.global_roles.name);
    return requiredRoles.some((role) => userRoleNames.includes(role));
  }

  private async checkUserCafeRoles(
    user_id: number,
    cafe_id: number,
    requiredRoles: string[],
  ): Promise<boolean> {
    const userCafeRoles = await this.prisma.user_cafe_roles.findMany({
      where: { user_id, cafe_id },
      include: { cafe_roles: true },
    });

    const userRoleNames = userCafeRoles.map((ucr) => ucr.cafe_roles.name);
    return requiredRoles.some((role) => userRoleNames.includes(role));
  }

  private extractCafeId(request: any): number | null {
    // Try to get café ID from route params
    const cafe_id = request.params?.cafe_id || request.params?.id;
    if (cafe_id && !isNaN(Number(cafe_id))) {
      return Number(cafe_id);
    }

    // Try to get café ID from body for POST requests
    if (request.body?.cafe_id && !isNaN(Number(request.body.cafe_id))) {
      return Number(request.body.cafe_id);
    }

    return null;
  }
}
