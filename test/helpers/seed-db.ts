import { createPost, createProfile, createUser } from './defaults';
import * as faker from 'faker';

export const seedDb = async () => {
  const [user1, user2] = await Promise.all([
    createUser({
      username: faker.internet.userName(),
    }).save(),
    createUser({
      username: faker.internet.userName(),
    }).save(),
  ]);

  const [profile1, profile2] = await Promise.all([
    createProfile({
      username: user1.username,
    }).save(),
    createProfile({
      username: user2.username,
    }).save(),
  ]);

  const posts1 = await Promise.all([
    createPost({
      authorUsername: profile1.username,
    }).save(),
    createPost({
      authorUsername: profile1.username,
    }).save(),
    createPost({
      authorUsername: profile1.username,
    }).save(),
  ]);

  const now = new Date();
  const posts2 = await Promise.all([
    createPost({
      authorUsername: profile2.username,
      createdAt: now,
    }).save(),
    createPost({
      authorUsername: profile2.username,
      createdAt: now,
    }).save(),
    createPost({
      authorUsername: profile2.username,
      createdAt: now,
    }).save(),
  ]);

  return {
    user1,
    user2,
    profile1,
    profile2,
    posts1,
    posts2,
  };
};
