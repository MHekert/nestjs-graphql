import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import {
  ForbiddenException,
  NotFoundException,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthJwtGuard } from '../auth/auth-jwt.guard';
import { GetUser } from '../auth/get-user.decorator';
import { UserData } from '../auth/local.strategy';
import { Profile } from '../profiles/entities/profile.entity';
import { PaginatedPosts } from './entities/paginated-posts.entity';
import { PaginationArgs } from '../../common/dto/pagination.args';
import ProfilesLoader from '../profiles/profiles.loader';

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly profilesLoader: ProfilesLoader,
  ) {}

  @UseGuards(AuthJwtGuard)
  @Mutation(() => Post)
  async createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @GetUser() user: UserData,
  ): Promise<Post> {
    const post = await this.postsService.create(createPostInput, user.username);

    return post;
  }

  @Query(() => PaginatedPosts, { name: 'posts' })
  async getPostsPage(
    @Args() paginationArgs: PaginationArgs,
    @Args('author', { nullable: true }) authorUsername?: string,
  ): Promise<PaginatedPosts> {
    return this.postsService.getPostsPagePage(paginationArgs, authorUsername);
  }

  @Query(() => Post, { name: 'post' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Post> {
    const post = await this.postsService.findOne(id);

    if (!post) throw new NotFoundException();

    return post;
  }

  @ResolveField('profile', () => Profile)
  async profile(@Parent() post: Post): Promise<Profile> {
    const { authorUsername } = post;
    return this.profilesLoader.batchProfiles.load(authorUsername);
  }

  @UseGuards(AuthJwtGuard)
  @Mutation(() => Post)
  async updatePost(
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
    @GetUser() user: UserData,
  ) {
    const post = await this.postsService.findOne(updatePostInput.id);
    if (post.authorUsername !== user.username) throw new ForbiddenException();

    await this.postsService.update(updatePostInput.id, updatePostInput);

    return { ...post, ...updatePostInput };
  }

  @UseGuards(AuthJwtGuard)
  @Mutation(() => String)
  async removePost(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @GetUser() user: UserData,
  ) {
    const post = await this.postsService.findOne(id);
    if (post.authorUsername !== user.username) throw new ForbiddenException();

    await this.postsService.remove(id);

    return id;
  }
}
