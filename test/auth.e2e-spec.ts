import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { seedDb } from './helpers/seed-db';
import { dropFromDB } from './helpers/drop-from-db';
import { User } from '../src/modules/users/entities/user.entity';
import { defaultTestPassword } from './helpers/defaults';
import * as faker from 'faker';
import { ConfigService } from '@nestjs/config';
import { getAccessToken } from './helpers/get-access-token';

describe('AuthResolver (e2e)', () => {
  let app: INestApplication;
  let user1: User;
  let user2: User;
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    configService = app.get(ConfigService);

    ({ user1, user2 } = await seedDb());
  });

  afterEach(async () => {
    await dropFromDB();
    await app.close();
  });

  describe('signUp', () => {
    it('should return accessToken after successful sign up', async () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation signUp($authInput: AuthInput!) {
            signUp(authInput: $authInput) {
              accessToken
            }
          }`,
          variables: {
            authInput: {
              username: faker.internet.userName(),
              password: faker.internet.password(),
            },
          },
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            data: {
              signUp: {
                accessToken: expect.any(String),
              },
            },
          });
        });
    });

    it('should return forbidder error when username already exists', async () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation signUp($authInput: AuthInput!) {
            signUp(authInput: $authInput) {
              accessToken
            }
          }`,
          variables: {
            authInput: {
              username: user1.username,
              password: '123',
            },
          },
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            data: null,
            errors: [
              {
                message: 'Forbidden',
              },
            ],
          });
        });
    });
  });

  describe('signIn', () => {
    it('should return accessToken after successful sign in', async () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `query signIn($authInput: AuthInput!) {
            signIn(authInput: $authInput) {
              accessToken
            }
          }`,
          variables: {
            authInput: {
              username: user1.username,
              password: defaultTestPassword,
            },
          },
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            data: {
              signIn: {
                accessToken: expect.any(String),
              },
            },
          });
        });
    });

    it('should return unauthorized error when wrong credentials passed', async () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `query signIn($authInput: AuthInput!) {
            signIn(authInput: $authInput) {
              accessToken
            }
          }`,
          variables: {
            authInput: {
              username: user1.username,
              password: faker.internet.password(),
            },
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

  describe('changePassword', () => {
    it('should return true after successful password change', async () => {
      const accessToken = await getAccessToken(user1, configService);

      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `mutation changePassword($authInput: AuthInput!) {
            changePassword(authInput: $authInput)
          }`,
          variables: {
            authInput: {
              username: user1.username,
              password: 'new_password',
            },
          },
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            data: {
              changePassword: true,
            },
          });
        });
    });

    it('should throw forbidden error when trying to change different users password', async () => {
      const accessToken = await getAccessToken(user1, configService);

      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `mutation changePassword($authInput: AuthInput!) {
            changePassword(authInput: $authInput)
          }`,
          variables: {
            authInput: {
              username: user2.username,
              password: 'new_password',
            },
          },
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            data: null,
            errors: [
              {
                message: 'Forbidden',
              },
            ],
          });
        });
    });
  });
});
