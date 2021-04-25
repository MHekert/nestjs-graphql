import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ProfilesService } from './profiles.service';
import { Profile } from './entities/profile.entity';
import { UpsertProfileInput } from './dto/upsert-profile.input';
import { User } from '../users/entities/user.entity';
import { PaginationArgs } from '../../common/dto/pagination.args';
import { PostsService } from '../posts/posts.service';
import { PaginatedPosts } from '../posts/entities/paginated-posts.entity';
import ProfilesLoader from './profiles.loader';
import UsersLoader from '../users/users.loader';
import { AuthJwtGuard } from '../auth/auth-jwt.guard';
import { UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/get-user.decorator';
import { UserData } from '../auth/local.strategy';

@Resolver(() => Profile)
export class ProfilesResolver {
  constructor(
    private readonly profilesLoader: ProfilesLoader,
    private readonly usersLoader: UsersLoader,
    private readonly profilesService: ProfilesService,
    private readonly postsService: PostsService,
  ) {}

  @UseGuards(AuthJwtGuard)
  @Mutation(() => Profile)
  upsertProfile(
    @Args('upsertProfileInput') upsertProfileInput: UpsertProfileInput,
    @GetUser() user: UserData,
  ): Promise<Profile> {
    return this.profilesService.create(upsertProfileInput, user.username);
  }

  @Query(() => Profile, { name: 'profile', nullable: true })
  async findOne(
    @Args('username') username: string,
  ): Promise<Profile | undefined> {
    return this.profilesLoader.batchProfiles.load(username);
  }

  @ResolveField('user', () => User)
  async profile(@Parent() profile: Profile) {
    const { username } = profile;
    return this.usersLoader.batchUsers.load(username);
  }

  @ResolveField('posts', () => PaginatedPosts)
  async posts(
    @Parent() profile: Profile,
    @Args() paginationArgs: PaginationArgs,
  ) {
    const { username } = profile;
    return this.postsService.getPostsPagePage(paginationArgs, username);
  }
}
