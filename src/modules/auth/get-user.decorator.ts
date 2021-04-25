import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserData } from './local.strategy';

export const GetUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserData => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
