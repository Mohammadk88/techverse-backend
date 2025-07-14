import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface User {
  id: number;
  email: string;
  role: string;
  [key: string]: any;
}

export interface RequestWithUser extends Request {
  user: User;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
