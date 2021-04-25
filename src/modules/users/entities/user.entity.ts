import { ObjectType, Field, ID } from '@nestjs/graphql';
import { BaseEntity, Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  @Field(() => ID)
  @Field()
  username: string;

  @Column()
  hash: string;

  @OneToOne(() => Profile, (profile) => profile.username)
  @Field(() => Profile, { nullable: true })
  profile: Profile;
}
