import { SetMetadata } from '@nestjs/common';

export const GlobalRoles = (...roles: string[]) =>
  SetMetadata('user_global_roles', roles);

export const CafeRoles = (...roles: string[]) =>
  SetMetadata('cafe_roles', roles);

// Global role constants
export const GLOBAL_ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  EDITOR: 'EDITOR',
  MEMBER: 'MEMBER',
} as const;

// Café role constants
export const CAFE_ROLES = {
  BARISTA: 'BARISTA',
  THINKER: 'THINKER',
  JOURNALIST: 'JOURNALIST',
  MEMBER: 'MEMBER',
} as const;
