import { Injectable } from '@nestjs/common';
import { PaginationArgs } from '../../common/dto/pagination.args';
import { OrderEnum } from '../../common/enums/order.enum';
import { createPage } from '../../common/utils/create-page';
import { Cursor } from '../../common/utils/cursor';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './entities/post.entity';
import { PostsRepository } from './repositories/posts.repository';

@Injectable()
export class PostsService {
  constructor(private postsRepository: PostsRepository) {}

  create(createPostInput: CreatePostInput, username: string): Promise<Post> {
    return this.postsRepository.createPost(
      username,
      createPostInput.text,
      createPostInput.title,
    );
  }

  private async getPosts(
    limit: number,
    order: OrderEnum,
    cursor?: string,
    username?: string,
  ): Promise<{ posts: Post[]; cursorCount: number; totalCount: number }> {
    const decodedCursor = Cursor.decode(cursor);

    const [[posts, cursorCount], totalCount] = await Promise.all([
      this.postsRepository.getPage(
        limit,
        order,
        decodedCursor?.lastId,
        decodedCursor?.threshold,
        username,
      ),
      this.postsRepository.getTotalCount(username),
    ]);

    return {
      posts,
      cursorCount,
      totalCount,
    };
  }

  async getPostsPagePage(paginationArgs: PaginationArgs, username?: string) {
    const { posts, totalCount, cursorCount } = await this.getPosts(
      paginationArgs.limit,
      paginationArgs.order,
      paginationArgs.cursor,
      username,
    );

    const hasNextPage = cursorCount - posts.length > 0;

    return createPage(posts, totalCount, hasNextPage, 'id', 'createdAt');
  }

  findOne(id: string) {
    return this.postsRepository.findOne(id);
  }

  update(id: string, updatePostInput: UpdatePostInput) {
    return this.postsRepository.update(id, updatePostInput);
  }

  remove(id: string) {
    return this.postsRepository.delete({ id });
  }
}
