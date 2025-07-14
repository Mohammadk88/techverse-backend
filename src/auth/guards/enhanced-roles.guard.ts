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
      'global_roles',
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
      const cafeId = this.extractCafeId(request);
      if (cafeId) {
        const hasCafeRole = await this.checkUserCafeRoles(
          user.id,
          cafeId,
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
    userId: number,
    requiredRoles: string[],
  ): Promise<boolean> {
    const userRoles = await this.prisma.userGlobalRole.findMany({
      where: { userId },
      include: { role: true },
    });

    const userRoleNames = userRoles.map((ur) => ur.role.name);
    return requiredRoles.some((role) => userRoleNames.includes(role));
  }

  private async checkUserCafeRoles(
    userId: number,
    cafeId: number,
    requiredRoles: string[],
  ): Promise<boolean> {
    const userCafeRoles = await this.prisma.userCafeRole.findMany({
      where: { userId, cafeId },
      include: { role: true },
    });

    const userRoleNames = userCafeRoles.map((ucr) => ucr.role.name);
    return requiredRoles.some((role) => userRoleNames.includes(role));
  }

  private extractCafeId(request: any): number | null {
    // Try to get café ID from route params
    const cafeId = request.params?.cafeId || request.params?.id;
    if (cafeId && !isNaN(Number(cafeId))) {
      return Number(cafeId);
    }

    // Try to get café ID from body for POST requests
    if (request.body?.cafeId && !isNaN(Number(request.body.cafeId))) {
      return Number(request.body.cafeId);
    }

    return null;
  }
}
