import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  // Global Roles
  async getGlobalRoles() {
    return this.prisma.global_roles.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createGlobalRole(role_name: string, description?: string) {
    return this.prisma.global_roles.create({
      data: { name: role_name, description, updated_at: new Date() },
    });
  }

  // Café Roles
  async getCafeRoles() {
    return this.prisma.cafe_roles.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createCafeRole(role_name: string, description?: string) {
    return this.prisma.cafe_roles.create({
      data: { name: role_name, description, updated_at: new Date() },
    });
  }

  // User Global Role Assignment
  async assignGlobalRole(user_id: number, role_id: number) {
    // Check if user exists
    const user = await this.prisma.users.findUnique({
      where: { id: user_id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if role exists
    const role = await this.prisma.user_global_roles.findUnique({
      where: { id: role_id },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.user_global_roles.findUnique({
      where: {
        user_id_role_id: {
          user_id,
          role_id,
        },
      },
    });

    if (existingAssignment) {
      throw new BadRequestException('User already has this role');
    }

    return this.prisma.user_global_roles.create({
      data: { user_id, role_id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            username: true,
          },
        },
        global_roles: true,
      },
    });
  }

  async removeGlobalRole(user_id: number, role_id: number) {
    const assignment = await this.prisma.user_global_roles.findUnique({
      where: {
        user_id_role_id: {
          user_id,
          role_id,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Role assignment not found');
    }

    return this.prisma.user_global_roles.delete({
      where: {
        user_id_role_id: {
          user_id,
          role_id,
        },
      },
    });
  }

  // User Café Role Assignment
  async assignCafeRole(user_id: number, cafe_id: number, role_id: number) {
    // Check if user exists
    const user = await this.prisma.users.findUnique({
      where: { id: user_id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if café exists
    const cafe = await this.prisma.cafes.findUnique({
      where: { id: cafe_id },
    });
    if (!cafe) {
      throw new NotFoundException('Café not found');
    }

    // Check if role exists
    const role = await this.prisma.cafe_roles.findUnique({
      where: { id: role_id },
    });
    if (!role) {
      throw new NotFoundException('Café role not found');
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.user_cafe_roles.findUnique({
      where: {
        user_id_cafe_id_role_id: {
          user_id,
          cafe_id,
          role_id,
        },
      },
    });

    if (existingAssignment) {
      throw new BadRequestException('User already has this role in this café');
    }

    return this.prisma.user_cafe_roles.create({
      data: { user_id, cafe_id, role_id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            username: true,
          },
        },
        cafes: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        cafe_roles: true,
      },
    });
  }

  async removeCafeRole(user_id: number, cafe_id: number, role_id: number) {
    const assignment = await this.prisma.user_cafe_roles.findUnique({
      where: {
        user_id_cafe_id_role_id: {
          user_id,
          cafe_id,
          role_id,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Café role assignment not found');
    }

    return this.prisma.user_cafe_roles.delete({
      where: {
        user_id_cafe_id_role_id: {
          user_id,
          cafe_id,
          role_id,
        },
      },
    });
  }

  // Helper methods to check user permissions
  async getUserGlobalRoles(user_id: number) {
    return this.prisma.user_global_roles.findMany({
      where: { user_id },
      include: { global_roles: true },
    });
  }

  async getUserCafeRoles(user_id: number, cafe_id?: number) {
    const where: any = { user_id };
    if (cafe_id) {
      where.cafe_id = cafe_id;
    }

    return this.prisma.user_cafe_roles.findMany({
      where,
      include: {
        cafe_roles: true,
        cafes: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async hasGlobalRole(user_id: number, roleName: string): Promise<boolean> {
    const assignment = await this.prisma.user_global_roles.findFirst({
      where: {
        user_id,
        global_roles: { name: roleName },
      },
    });

    return !!assignment;
  }

  async hasCafeRole(
    user_id: number,
    cafe_id: number,
    roleName: string,
  ): Promise<boolean> {
    const assignment = await this.prisma.user_cafe_roles.findFirst({
      where: {
        user_id,
        cafe_id,
        cafe_roles: { name: roleName },
      },
    });

    return !!assignment;
  }
}
