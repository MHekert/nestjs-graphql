import { ObjectType, Field, ID, GraphQLTimestamp } from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Profile)
  @ManyToOne(() => Profile, (profile) => profile.username)
  @JoinColumn({ name: 'author_username' })
  profile: Profile;

  @Column({ name: 'author_username' })
  authorUsername: string;

  @Field()
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Field()
  @Column()
  text: string;

  @Index()
  @Field(() => GraphQLTimestamp)
  @CreateDateColumn({ name: 'created_at', precision: 3 })
  createdAt: Number;

  @Field(() => GraphQLTimestamp)
  @UpdateDateColumn({ name: 'updated_at', precision: 3 })
  updatedAt: Number;
}
