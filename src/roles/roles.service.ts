import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  // Global Roles
  async getGlobalRoles() {
    return this.prisma.globalRole.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createGlobalRole(name: string, description?: string) {
    return this.prisma.globalRole.create({
      data: { name, description },
    });
  }

  // Café Roles
  async getCafeRoles() {
    return this.prisma.cafeRole.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createCafeRole(name: string, description?: string) {
    return this.prisma.cafeRole.create({
      data: { name, description },
    });
  }

  // User Global Role Assignment
  async assignGlobalRole(userId: number, roleId: number) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if role exists
    const role = await this.prisma.globalRole.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.userGlobalRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (existingAssignment) {
      throw new BadRequestException('User already has this role');
    }

    return this.prisma.userGlobalRole.create({
      data: { userId, roleId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        role: true,
      },
    });
  }

  async removeGlobalRole(userId: number, roleId: number) {
    const assignment = await this.prisma.userGlobalRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Role assignment not found');
    }

    return this.prisma.userGlobalRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });
  }

  // User Café Role Assignment
  async assignCafeRole(userId: number, cafeId: number, roleId: number) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if café exists
    const cafe = await this.prisma.cafe.findUnique({
      where: { id: cafeId },
    });
    if (!cafe) {
      throw new NotFoundException('Café not found');
    }

    // Check if role exists
    const role = await this.prisma.cafeRole.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException('Café role not found');
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.userCafeRole.findUnique({
      where: {
        userId_cafeId_roleId: {
          userId,
          cafeId,
          roleId,
        },
      },
    });

    if (existingAssignment) {
      throw new BadRequestException('User already has this role in this café');
    }

    return this.prisma.userCafeRole.create({
      data: { userId, cafeId, roleId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        cafe: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        role: true,
      },
    });
  }

  async removeCafeRole(userId: number, cafeId: number, roleId: number) {
    const assignment = await this.prisma.userCafeRole.findUnique({
      where: {
        userId_cafeId_roleId: {
          userId,
          cafeId,
          roleId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Café role assignment not found');
    }

    return this.prisma.userCafeRole.delete({
      where: {
        userId_cafeId_roleId: {
          userId,
          cafeId,
          roleId,
        },
      },
    });
  }

  // Helper methods to check user permissions
  async getUserGlobalRoles(userId: number) {
    return this.prisma.userGlobalRole.findMany({
      where: { userId },
      include: { role: true },
    });
  }

  async getUserCafeRoles(userId: number, cafeId?: number) {
    const where: any = { userId };
    if (cafeId) {
      where.cafeId = cafeId;
    }

    return this.prisma.userCafeRole.findMany({
      where,
      include: {
        role: true,
        cafe: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async hasGlobalRole(userId: number, roleName: string): Promise<boolean> {
    const assignment = await this.prisma.userGlobalRole.findFirst({
      where: {
        userId,
        role: { name: roleName },
      },
    });

    return !!assignment;
  }

  async hasCafeRole(
    userId: number,
    cafeId: number,
    roleName: string,
  ): Promise<boolean> {
    const assignment = await this.prisma.userCafeRole.findFirst({
      where: {
        userId,
        cafeId,
        role: { name: roleName },
      },
    });

    return !!assignment;
  }
}
