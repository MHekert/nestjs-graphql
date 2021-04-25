import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { seedDb } from './helpers/seed-db';
import { dropFromDB } from './helpers/drop-from-db';
import { User } from '../src/modules/users/entities/user.entity';
import * as faker from 'faker';
import { ConfigService } from '@nestjs/config';
import { getAccessToken } from './helpers/get-access-token';
import { UpsertProfileInput } from '../src/modules/profiles/dto/upsert-profile.input';
import { Profile } from '../src/modules/profiles/entities/profile.entity';

describe('PostsResolver (e2e)', () => {
  let app: INestApplication;
  let user1: User;
  let profile1: Profile;
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    configService = app.get(ConfigService);

    ({ user1, profile1 } = await seedDb());
  });

  afterEach(async () => {
    await dropFromDB();
    await app.close();
  });

  describe('upsertProfile', () => {
    it('should return updated profile', async () => {
      const accessToken = await getAccessToken(user1, configService);

      const upsertProfileInput: UpsertProfileInput = {
        bio: faker.random.alphaNumeric(),
      };

      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `mutation upsertProfile($upsertProfileInput: UpsertProfileInput!) {
            upsertProfile(upsertProfileInput: $upsertProfileInput) {
              username
              bio
            }
          }`,
          variables: {
            upsertProfileInput,
          },
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            data: {
              upsertProfile: {
                username: user1.username,
                bio: upsertProfileInput.bio,
              },
            },
          });
        });
    });

    it('should throw unauthorized error when no access token passed', async () => {
      const upsertProfileInput: UpsertProfileInput = {
        bio: faker.random.alphaNumeric(),
      };

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation upsertProfile($upsertProfileInput: UpsertProfileInput!) {
            upsertProfile(upsertProfileInput: $upsertProfileInput) {
              username
              bio
            }
          }`,
          variables: {
            upsertProfileInput,
          },
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            data: null,
            errors: [
              {
                message: 'Unauthorized',
              },
            ],
          });
        });
    });
  });

  describe('Profile', () => {
    it('should return query results', async () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `query profile($username: String!) {
              profile(username: $username) {
                username
                bio
                user {
                  username
                }
                posts {
                  totalCount
                  hasNextPage
                  nodes {
                    id
                  }
                  edges {
                    cursor
                    node {
                      id
                    }
                  }
                }
              }
            }`,
          variables: {
            username: profile1.username,
          },
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            data: {
              profile: {
                username: profile1.username,
                bio: profile1.bio,
                user: {
                  username: profile1.username,
                },
                posts: {
                  totalCount: expect.any(Number),
                  hasNextPage: expect.any(Boolean),
                  nodes: expect.arrayContaining([
                    {
                      id: expect.any(String),
                    },
                  ]),
                  edges: expect.arrayContaining([
                    {
                      cursor: expect.any(String),
                      node: {
                        id: expect.any(String),
                      },
                    },
                  ]),
                },
              },
            },
          });
        });
    });
  });
});
