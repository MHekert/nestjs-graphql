import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { AuthInput } from './dto/auth.input';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { AuthLocalGuard } from './auth-local.guard';
import { GetUser } from './get-user.decorator';
import { AuthJwtGuard } from './auth-jwt.guard';
import { UserData } from './local.strategy';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Auth)
  async signUp(@Args('authInput') authInput: AuthInput) {
    const user = await this.authService.signUp(authInput);

    return await this.authService.generateJwt(user.username);
  }

  @UseGuards(AuthJwtGuard)
  @Mutation(() => Boolean)
  async changePassword(
    @Args('authInput') authInput: AuthInput,
    @GetUser() user: UserData,
  ) {
    if (authInput.username !== user.username) throw new ForbiddenException();

    await this.authService.changePassword(authInput);

    return true;
  }

  @Query(() => Auth)
  @UseGuards(AuthLocalGuard)
  async signIn(
    @Args('authInput') _authInput: AuthInput,
    @GetUser() user: UserData,
  ) {
    return await this.authService.generateJwt(user.username);
  }
}
