import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../../common/dto/paginated.generic';
import { Post } from './post.entity';

@ObjectType()
export class PaginatedPosts extends Paginated(Post) {}
