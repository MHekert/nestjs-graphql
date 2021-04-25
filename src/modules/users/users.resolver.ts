import { Resolver, Query, Parent, ResolveField } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { AuthJwtGuard } from '../auth/auth-jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { UserData } from '../auth/local.strategy';
import { Profile } from '../profiles/entities/profile.entity';
import ProfilesLoader from '../profiles/profiles.loader';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly profilesLoader: ProfilesLoader) {}

  @UseGuards(AuthJwtGuard)
  @Query(() => User, { name: 'me' })
  getLoggedUser(@GetUser() user: UserData) {
    return user;
  }

  @ResolveField('profile', () => Profile)
  profile(@Parent() user: User) {
    const { username } = user;
    return this.profilesLoader.batchProfiles.load(username);
  }
}
