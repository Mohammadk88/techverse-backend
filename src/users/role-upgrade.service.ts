import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { user_roles } from '@prisma/client';

@Injectable()
export class RoleUpgradeService {
  private readonly XP_THRESHOLDS = {
    [user_roles.GUEST]: 0,
    [user_roles.MEMBER]: 0,
    [user_roles.JOURNALIST]: 1000, // Renamed from AUTHOR
    [user_roles.THINKER]: 3000,
    [user_roles.BARISTA]: 7000,
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check and upgrade user role based on XP
   */
  async checkAndUpgradeRole(userId: number): Promise<{
    upgraded: boolean;
    oldRole: user_roles;
    newRole: user_roles;
    xp: number;
  }> {
    // Get user's current XP and role
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { xp: true, role: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const currentRole = user.role;
    const currentXP = user.xp;
    const newRole = this.calculateRoleFromXP(currentXP);

    // If role should be upgraded
    if (this.isRoleUpgrade(currentRole, newRole)) {
      await this.prisma.users.update({
        where: { id: userId },
        data: { role: newRole },
      });

      return {
        upgraded: true,
        oldRole: currentRole,
        newRole,
        xp: currentXP,
      };
    }

    return {
      upgraded: false,
      oldRole: currentRole,
      newRole: currentRole,
      xp: currentXP,
    };
  }

  /**
   * Calculate what role a user should have based on XP
   */
  private calculateRoleFromXP(xp: number): user_roles {
    if (xp >= this.XP_THRESHOLDS[user_roles.BARISTA]) {
      return user_roles.BARISTA;
    }
    if (xp >= this.XP_THRESHOLDS[user_roles.THINKER]) {
      return user_roles.THINKER;
    }
    if (xp >= this.XP_THRESHOLDS[user_roles.JOURNALIST]) {
      return user_roles.JOURNALIST;
    }
    return user_roles.MEMBER;
  }

  /**
   * Check if the new role is actually an upgrade from current role
   */
  private isRoleUpgrade(currentRole: user_roles, newRole: user_roles): boolean {
    const roleHierarchy = [
      user_roles.GUEST,
      user_roles.MEMBER,
      user_roles.JOURNALIST,
      user_roles.THINKER,
      user_roles.BARISTA,
    ];

    const currentIndex = roleHierarchy.indexOf(currentRole);
    const newIndex = roleHierarchy.indexOf(newRole);

    return newIndex > currentIndex;
  }

  /**
   * Get next role and required XP for user
   */
  async getNextRoleInfo(userId: number): Promise<{
    currentRole: user_roles;
    currentXP: number;
    nextRole: user_roles | null;
    xpRequired: number | null;
    progress: number; // 0-100 percentage
  }> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { xp: true, role: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const roleHierarchy = [
      user_roles.GUEST,
      user_roles.MEMBER,
      user_roles.JOURNALIST,
      user_roles.THINKER,
      user_roles.BARISTA,
    ];

    const currentIndex = roleHierarchy.indexOf(user.role);
    const nextRole =
      currentIndex < roleHierarchy.length - 1
        ? roleHierarchy[currentIndex + 1]
        : null;

    if (!nextRole) {
      return {
        currentRole: user.role,
        currentXP: user.xp,
        nextRole: null,
        xpRequired: null,
        progress: 100,
      };
    }

    const nextRoleXP = this.XP_THRESHOLDS[nextRole];
    const currentRoleXP = this.XP_THRESHOLDS[user.role];
    const progress = Math.min(
      ((user.xp - currentRoleXP) / (nextRoleXP - currentRoleXP)) * 100,
      100,
    );

    return {
      currentRole: user.role,
      currentXP: user.xp,
      nextRole,
      xpRequired: Math.max(0, nextRoleXP - user.xp),
      progress: Math.max(0, progress),
    };
  }

  /**
   * Award XP to user and check for role upgrade
   */
  async awardXP(
    userId: number,
    xpAmount: number,
    _reason: string,
  ): Promise<{
    xpAwarded: number;
    totalXP: number;
    roleUpgrade?: {
      oldRole: user_roles;
      newRole: user_roles;
    };
  }> {
    // Update user XP
    const updatedUser = await this.prisma.users.update({
      where: { id: userId },
      data: {
        xp: {
          increment: xpAmount,
        },
      },
      select: { xp: true, role: true },
    });

    // Check for role upgrade
    const upgradeResult = await this.checkAndUpgradeRole(userId);

    const result: {
      xpAwarded: number;
      totalXP: number;
      roleUpgrade?: {
        oldRole: user_roles;
        newRole: user_roles;
      };
    } = {
      xpAwarded: xpAmount,
      totalXP: updatedUser.xp,
    };

    if (upgradeResult.upgraded) {
      result.roleUpgrade = {
        oldRole: upgradeResult.oldRole,
        newRole: upgradeResult.newRole,
      };
    }

    return result;
  }

  /**
   * Get XP thresholds for all roles
   */
  getXPThresholds() {
    return this.XP_THRESHOLDS;
  }
}
