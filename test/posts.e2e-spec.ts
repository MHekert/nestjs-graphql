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
import { CreatePostInput } from '../src/modules/posts/dto/create-post.input';
import { Profile } from '../src/modules/profiles/entities/profile.entity';
import { UpdatePostInput } from '../src/modules/posts/dto/update-post.input';
import { Post } from '../src/modules/posts/entities/post.entity';
import { PaginationArgs } from '../src/common/dto/pagination.args';

describe('PostsResolver (e2e)', () => {
  let app: INestApplication;
  let user1: User;
  let user2: User;
  let profile1: Profile;
  let posts1: Post[];
  let posts2: Post[];
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    configService = app.get(ConfigService);

    ({ user1, user2, profile1, posts1, posts2 } = await seedDb());
  });

  afterEach(async () => {
    await dropFromDB();
    await app.close();
  });

  describe('createPost', () => {
    it('should return created post', async () => {
      const accessToken = await getAccessToken(user1, configService);

      const createPostInput: CreatePostInput = {
        text: faker.random.alphaNumeric(),
        title: faker.random.alphaNumeric(),
      };

      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `mutation createPost($createPostInput: CreatePostInput!) {
            createPost(createPostInput: $createPostInput) {
              id
              text
              title
              createdAt
              updatedAt
            }
          }`,
          variables: {
            createPostInput,
          },
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            data: {
              createPost: {
                id: expect.any(String),
                text: createPostInput.text,
                title: createPostInput.title,
                createdAt: expect.any(Number),
                updatedAt: expect.any(Number),
              },
            },
          });
        });
    });

    it('should throw unauthorized error when no access token passed', async () => {
      const createPostInput: CreatePostInput = {
        text: faker.random.alphaNumeric(),
        title: faker.random.alphaNumeric(),
      };

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation createPost($createPostInput: CreatePostInput!) {
            createPost(createPostInput: $createPostInput) {
              id
            }
          }`,
          variables: {
            createPostInput,
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

  describe('updatePost', () => {
    it('should return updated post', async () => {
      const [post] = posts1;
      const text = faker.random.words();
      const title = faker.random.words();

      const updatePostInput: UpdatePostInput = {
        id: post.id,
        text,
        title,
      };
      const accessToken = await getAccessToken(user1, configService);

      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `mutation updatePost($updatePostInput: UpdatePostInput!) {
            updatePost(updatePostInput: $updatePostInput) {
              id
              title
              text
            }
          }`,
          variables: {
            updatePostInput,
          },
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            data: {
              updatePost: {
                id: post.id,
                text,
                title,
              },
            },
          });
        });
    });

    it('should throw unauthorized error when no access token passed', async () => {
      const [post] = posts1;
      const text = faker.random.words();
      const title = faker.random.words();

      const updatePostInput: UpdatePostInput = {
        id: post.id,
        text,
        title,
      };

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation updatePost($updatePostInput: UpdatePostInput!) {
            updatePost(updatePostInput: $updatePostInput) {
              id
              title
              text
            }
          }`,
          variables: {
            updatePostInput,
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

  describe('removePost', () => {
    it('should return id of removed post', async () => {
      const [post] = posts1;
      const accessToken = await getAccessToken(user1, configService);

      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `mutation removePost($id: ID!) {
            removePost(id: $id)
          }`,
          variables: {
            id: post.id,
          },
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            data: {
              removePost: post.id,
            },
          });
        });
    });

    it('should throw unauthorized error when no access token passed', async () => {
      const [post] = posts1;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation removePost($id: ID!) {
            removePost(id: $id)
          }`,
          variables: {
            id: post.id,
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

    it('should throw forbidden error when trying to remove other user post', async () => {
      const [post] = posts2;
      const accessToken = await getAccessToken(user1, configService);

      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `mutation removePost($id: ID!) {
            removePost(id: $id)
          }`,
          variables: {
            id: post.id,
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

  describe('findOne', () => {
    it('should return query results', async () => {
      const [post] = posts1;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `query post($id: ID!) {
            post(id: $id) {
              id
              title
              text
              createdAt
              updatedAt
              profile {
                username
                bio
              }
            }
          }`,
          variables: {
            id: post.id,
          },
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            data: {
              post: {
                id: post.id,
                title: post.title,
                text: post.text,
                createdAt: expect.any(Number),
                updatedAt: expect.any(Number),
                profile: {
                  username: profile1.username,
                  bio: profile1.bio,
                },
              },
            },
          });
        });
    });
  });

  describe('getPostsPage', () => {
    it('should return query results', async () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `query posts {
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
                  title
                  text
                  createdAt
                  updatedAt
                }
              }
            }
          }`,
        })
        .expect(200)
        .then((response) => {
          const expectedNodeIds = [
            ...posts1.map((e) => ({ id: e.id })),
            ...posts2.map((e) => ({ id: e.id })),
          ];
          const expectedTotalCount = posts1.length + posts2.length;
          const cursors: string[] = response.body.data.posts.edges.map(
            (e) => e.cursor,
          );
          const uniqCursors = [...new Set(cursors)];
          const createdAt = response.body.data.posts.edges.map(
            (e) => e.node.createdAt,
          );

          expect([...createdAt]).toStrictEqual([...createdAt].sort().reverse());
          expect(cursors).toHaveLength(uniqCursors.length);
          expect(cursors).toHaveLength(expectedTotalCount);
          expect(response.body).toMatchObject({
            data: {
              posts: {
                totalCount: expectedTotalCount,
                hasNextPage: false,
                nodes: expect.arrayContaining(expectedNodeIds),
                edges: expect.arrayContaining([
                  {
                    cursor: expect.any(String),
                    node: {
                      id: expect.any(String),
                      title: expect.any(String),
                      text: expect.any(String),
                      createdAt: expect.any(Number),
                      updatedAt: expect.any(Number),
                    },
                  },
                ]),
              },
            },
          });
        });
    });

    it('should return limited query results', async () => {
      const paginationArgs = new PaginationArgs();
      paginationArgs.limit = 1;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `query posts($limit: Int!) {
              posts(limit: $limit) {
                totalCount
                hasNextPage
                nodes {
                  id
                }
                edges {
                  cursor
                  node {
                    id
                    title
                    text
                    createdAt
                    updatedAt
                  }
                }
              }
            }`,
          variables: {
            ...paginationArgs,
          },
        })
        .expect(200)
        .then((response) => {
          const expectedTotalCount = posts1.length + posts2.length;

          expect(response.body).toMatchObject({
            data: {
              posts: {
                totalCount: expectedTotalCount,
                hasNextPage: true,
                nodes: expect.arrayContaining([{ id: expect.any(String) }]),
                edges: expect.arrayContaining([
                  {
                    cursor: expect.any(String),
                    node: {
                      id: expect.any(String),
                      title: expect.any(String),
                      text: expect.any(String),
                      createdAt: expect.any(Number),
                      updatedAt: expect.any(Number),
                    },
                  },
                ]),
              },
            },
          });
        });
    });

    it('should return posts of specific user', async () => {
      const paginationArgs = new PaginationArgs();
      paginationArgs.limit = 1;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `query posts($author: String!) {
              posts(author: $author) {
                totalCount
                hasNextPage
                nodes {
                  id
                }
                edges {
                  cursor
                  node {
                    id
                    title
                    text
                    createdAt
                    updatedAt
                  }
                }
              }
            }`,
          variables: {
            author: user1.username,
          },
        })
        .expect(200)
        .then((response) => {
          const expectedTotalCount = posts1.length;
          const expectedReturnedEdgesLength = posts1.length;
          const edges = response.body.data.posts.edges;

          expect(edges).toHaveLength(expectedReturnedEdgesLength);
          expect(response.body).toMatchObject({
            data: {
              posts: {
                totalCount: expectedTotalCount,
                hasNextPage: false,
                nodes: expect.arrayContaining([{ id: expect.any(String) }]),
                edges: expect.arrayContaining([
                  {
                    cursor: expect.any(String),
                    node: {
                      id: expect.any(String),
                      title: expect.any(String),
                      text: expect.any(String),
                      createdAt: expect.any(Number),
                      updatedAt: expect.any(Number),
                    },
                  },
                ]),
              },
            },
          });
        });
    });

    it('should correctly handle pagination with non unique timestamps', async () => {
      const firstResp: any = await new Promise((resolve, reject) => {
        request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: `query posts($author: String!, $limit: Int!) {
              posts(author: $author, limit: $limit) {
                totalCount
                hasNextPage
                nodes {
                  id
                }
                edges {
                  cursor
                  node {
                    id
                    title
                    text
                    createdAt
                    updatedAt
                  }
                }
              }
            }`,
            variables: {
              author: user2.username,
              limit: 1,
            },
          })
          .then((response) => {
            resolve(response);
          })
          .catch((reason) => reject(reason));
      });

      const edge = firstResp.body.data.posts.edges[0];
      const cursor = edge.cursor;
      const firstId = edge.node.id;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `query posts($author: String!, $cursor: String!) {
              posts(author: $author, cursor: $cursor) {
                totalCount
                hasNextPage
                nodes {
                  id
                }
                edges {
                  cursor
                  node {
                    id
                    title
                    text
                    createdAt
                    updatedAt
                  }
                }
              }
            }`,
          variables: {
            author: user2.username,
            cursor,
          },
        })
        .expect(200)
        .then((response) => {
          const expectedTotalCount = posts2.length;
          const expectedReturnedEdgesLength = expectedTotalCount - 1;
          const edges = response.body.data.posts.edges;
          const postIds = edges.map((e) => e.node.id);

          expect(edges).toHaveLength(expectedReturnedEdgesLength);
          expect(postIds).not.toContain(firstId);
          expect(response.body).toMatchObject({
            data: {
              posts: {
                totalCount: expectedTotalCount,
                hasNextPage: false,
                nodes: expect.arrayContaining([{ id: expect.any(String) }]),
                edges: expect.arrayContaining([
                  {
                    cursor: expect.any(String),
                    node: {
                      id: expect.any(String),
                      title: expect.any(String),
                      text: expect.any(String),
                      createdAt: expect.any(Number),
                      updatedAt: expect.any(Number),
                    },
                  },
                ]),
              },
            },
          });
        });
    });

    it('should return next post', async () => {
      const paginationArgs = new PaginationArgs();
      paginationArgs.limit = 1;

      const firstResp: any = await new Promise((resolve, reject) => {
        request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: `query posts($limit: Int!) {
                posts(limit: $limit) {
                  edges {
                    cursor
                    node {
                      id
                    }
                  }
                }
              }`,
            variables: {
              limit: 1,
            },
          })
          .then((response) => {
            resolve(response);
          })
          .catch((reason) => reject(reason));
      });

      const cursor = firstResp.body.data.posts.edges[0].cursor;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `query posts($cursor: String!) {
              posts(cursor: $cursor) {
                totalCount
                hasNextPage
                nodes {
                  id
                }
                edges {
                  cursor
                  node {
                    id
                    title
                    text
                    createdAt
                    updatedAt
                  }
                }
              }
            }`,
          variables: {
            cursor,
          },
        })
        .expect(200)
        .then((response) => {
          const expectedTotalCount = posts1.length + posts2.length;
          const expectedReturnedEdgesLength = expectedTotalCount - 1;
          const edges = response.body.data.posts.edges;

          expect(edges).toHaveLength(expectedReturnedEdgesLength);

          expect(response.body).toMatchObject({
            data: {
              posts: {
                totalCount: expectedTotalCount,
                hasNextPage: false,
                nodes: expect.arrayContaining([{ id: expect.any(String) }]),
                edges: expect.arrayContaining([
                  {
                    cursor: expect.any(String),
                    node: {
                      id: expect.any(String),
                      title: expect.any(String),
                      text: expect.any(String),
                      createdAt: expect.any(Number),
                      updatedAt: expect.any(Number),
                    },
                  },
                ]),
              },
            },
          });
        });
    });
  });
});
