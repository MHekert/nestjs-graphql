import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthLocalGuard extends AuthGuard('local') implements CanActivate {
  constructor() {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    try {
      req.body.username = req.body.variables.authInput.username;
      req.body.password = req.body.variables.authInput.password;
    } catch (err) {
      throw new BadRequestException('Pass arguments as variables');
    }

    return req;
  }
}
