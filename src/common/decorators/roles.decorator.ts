import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  GUEST = 'GUEST',
  MEMBER = 'MEMBER',
  THINKER = 'THINKER',
  JOURNALIST = 'JOURNALIST',
  BARISTA = 'BARISTA',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
