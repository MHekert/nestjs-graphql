import { hashSync } from 'bcrypt';
import * as faker from 'faker';
import { DeepPartial } from 'typeorm';
import { Profile } from '../../src/modules/profiles/entities/profile.entity';
import { User } from '../../src/modules/users/entities/user.entity';
import { Post } from '../../src/modules/posts/entities/post.entity';

const username = faker.internet.userName();
export const defaultTestPassword = 'keyboardCat';

export const createUser = (user: DeepPartial<User> = {}): User => {
  const defaultObject: DeepPartial<User> = {
    hash: hashSync(defaultTestPassword, 12),
    username,
  };
  return User.create({ ...defaultObject, ...user });
};

export const createProfile = (profile: DeepPartial<Profile> = {}): Profile => {
  const defaultObject: DeepPartial<Profile> = {
    username,
  };
  return Profile.create({ ...defaultObject, ...profile });
};

export const createPost = (post: DeepPartial<Post> = {}): Post => {
  const defaultObject: DeepPartial<Post> = {
    authorUsername: username,
    title: faker.random.words(),
    text: faker.random.words(),
  };
  return Post.create({ ...defaultObject, ...post });
};
