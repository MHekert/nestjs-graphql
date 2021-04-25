import { EntityRepository, Repository } from 'typeorm';
import { OrderEnum } from '../../../common/enums/order.enum';
import { Post } from '../entities/post.entity';
import { formatTimestampWithoutTimezone } from '../../../common/utils/format-timestamp-without-timzeone';

@EntityRepository(Post)
export class PostsRepository extends Repository<Post> {
  createPost(username: string, text: string, title: string): Promise<Post> {
    return this.create({
      authorUsername: username,
      text,
      title,
    }).save();
  }

  getPage(
    limit: number,
    order: OrderEnum,
    lastId?: string,
    threshold?: number,
    username?: string,
  ): Promise<[Post[], number]> {
    const query = this.createQueryBuilder('post')
      .limit(limit)
      .orderBy('created_at', order)
      .addOrderBy('id', OrderEnum.ASC);

    if (username) {
      query.andWhere('post.authorUsername = :username', {
        username,
      });
    }

    if (lastId && threshold) {
      const comparison = order === OrderEnum.ASC ? '>' : '<';
      query
        .andWhere(`post.createdAt ${comparison} :threshold`, {
          threshold: formatTimestampWithoutTimezone(threshold),
        })
        .orWhere('(post.createdAt = :threshold AND post.id > :lastId)', {
          threshold: formatTimestampWithoutTimezone(threshold),
          lastId,
        });
    }

    return query.getManyAndCount();
  }

  getTotalCount(username?: string): Promise<number> {
    const query = this.createQueryBuilder('post');

    if (username) {
      query.where('post.authorUsername = :username', {
        username,
      });
    }

    return query.getCount();
  }
}
