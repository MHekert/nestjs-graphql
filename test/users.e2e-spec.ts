import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { seedDb } from './helpers/seed-db';
import { dropFromDB } from './helpers/drop-from-db';
import { User } from '../src/modules/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { getAccessToken } from './helpers/get-access-token';
import { Profile } from '../src/modules/profiles/entities/profile.entity';

describe('UsersResolver (e2e)', () => {
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

  describe('me', () => {
    it('should return logged in user', async () => {
      const accessToken = await getAccessToken(user1, configService);

      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `query me {
            me {
              username
              profile {
                username
                bio
              }
            }
          }`,
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            data: {
              me: {
                username: user1.username,
                profile: {
                  username: profile1.username,
                  bio: profile1.bio,
                },
              },
            },
          });
        });
    });

    it('should throw unauthorized error when no access token passed', async () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `query me {
            me {
              username
              profile {
                username
                bio
              }
            }
          }`,
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
});
