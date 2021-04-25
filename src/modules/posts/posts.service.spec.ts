import { Test, TestingModule } from '@nestjs/testing';
import { PartialMockObject } from '../../../mocks/mock-types';
import { PostsService } from './posts.service';
import { PostsRepository } from './repositories/posts.repository';
import * as faker from 'faker';
import { UpdatePostInput } from './dto/update-post.input';
import { CreatePostInput } from './dto/create-post.input';
import { usernameMock } from '../../../mocks/username.mock';
import { PaginationArgs } from '../../common/dto/pagination.args';
import { Post } from './entities/post.entity';

describe('PostsService', () => {
  let service: PostsService;
  let postsRepositoryMock: PartialMockObject<PostsRepository>;
  const id = faker.datatype.uuid();

  const post = new Post();
  post.authorUsername = usernameMock;
  post.id = id;
  const posts = [post];

  beforeEach(async () => {
    postsRepositoryMock = {
      createPost: jest.fn(),
      getPage: jest.fn().mockResolvedValue([posts, 2]),
      getTotalCount: jest.fn().mockResolvedValue(2),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PostsRepository,
          useValue: postsRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create method', () => {
    it('should call correct repository method with correct parameters', () => {
      const createPostInput: CreatePostInput = {
        text: faker.random.alphaNumeric(),
        title: faker.random.alphaNumeric(),
      };

      service.create(createPostInput, usernameMock);

      expect(postsRepositoryMock.createPost).toBeCalledTimes(1);
      expect(postsRepositoryMock.createPost).toBeCalledWith(
        usernameMock,
        createPostInput.text,
        createPostInput.title,
      );
    });
  });
  describe('getPostsPagePage method', () => {
    it('should call correct repository method with correct parameters', async () => {
      const paginationArgs: PaginationArgs = {
        limit: 1,
      };

      const resp = await service.getPostsPagePage(paginationArgs);

      expect(resp).toMatchObject({
        edges: [
          {
            node: expect.any(Post),
            cursor: expect.any(String),
          },
        ],
        nodes: [
          {
            authorUsername: usernameMock,
            id,
          },
        ],
        totalCount: 2,
        hasNextPage: true,
      });
    });
  });
  describe('findOne method', () => {
    it('should call correct repository method with correct parameters', () => {
      service.findOne(id);

      expect(postsRepositoryMock.findOne).toBeCalledTimes(1);
      expect(postsRepositoryMock.findOne).toBeCalledWith(id);
    });
  });
  describe('update method', () => {
    it('should call correct repository method with correct parameters', () => {
      const updatePostInput: UpdatePostInput = {
        id,
        text: faker.random.alphaNumeric(),
      };

      service.update(id, updatePostInput);

      expect(postsRepositoryMock.update).toBeCalledTimes(1);
      expect(postsRepositoryMock.update).toBeCalledWith(id, updatePostInput);
    });
  });
  describe('remove method', () => {
    it('should call correct repository method with correct parameters', () => {
      service.remove(id);

      expect(postsRepositoryMock.delete).toBeCalledTimes(1);
      expect(postsRepositoryMock.delete).toBeCalledWith({ id });
    });
  });
});
