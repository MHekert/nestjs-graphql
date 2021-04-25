import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { IPaginated } from '../../../common/dto/paginated.generic';
import { PaginatedPosts } from '../../posts/entities/paginated-posts.entity';
import { Post } from '../../posts/entities/post.entity';
import { User } from '../../users/entities/user.entity';

@ObjectType()
@Entity()
export class Profile extends BaseEntity {
  @PrimaryColumn()
  @Field(() => ID)
  username: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Field(() => User)
  @OneToOne(() => User, (user) => user.username)
  user: User;

  @OneToMany(() => Post, (post) => post.profile)
  posts: Post[];

  @Field(() => [PaginatedPosts], { name: 'posts' })
  ownPosts?: IPaginated<Post>;
}
