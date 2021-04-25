import { Test, TestingModule } from '@nestjs/testing';
import { PartialMockObject } from '../../../mocks/mock-types';
import { PaginationArgs } from '../../common/dto/pagination.args';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';
import * as faker from 'faker';
import { CreatePostInput } from './dto/create-post.input';
import { userDataMock } from '../../../mocks/user-data.mock';
import { Post } from './entities/post.entity';
import { UpdatePostInput } from './dto/update-post.input';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import ProfilesLoader from '../profiles/profiles.loader';

describe('PostsResolver', () => {
  let resolver: PostsResolver;
  let postsServiceMock: PartialMockObject<PostsService>;
  let profilesLoaderMock: PartialMockObject<ProfilesLoader>;

  beforeEach(async () => {
    postsServiceMock = {
      create: jest.fn(),
      getPostsPagePage: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    profilesLoaderMock = {
      batchProfiles: <any>{
        load: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsResolver,
        {
          provide: PostsService,
          useValue: postsServiceMock,
        },
        {
          provide: ProfilesLoader,
          useValue: profilesLoaderMock,
        },
      ],
    }).compile();

    resolver = module.get<PostsResolver>(PostsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createPost resolver', () => {
    it('should call correct service methods with correct params', async () => {
      const createPostInput: CreatePostInput = {
        text: faker.random.alphaNumeric(),
        title: faker.random.alphaNumeric(),
      };

      await resolver.createPost(createPostInput, userDataMock);

      expect(postsServiceMock.create).toBeCalledTimes(1);
      expect(postsServiceMock.create).toBeCalledWith(
        createPostInput,
        userDataMock.username,
      );
    });
  });

  describe('getPostsPage resolver', () => {
    it('should call correct service methods with correct params', async () => {
      const paginationArgsMock: PaginationArgs = {
        limit: 10,
      };
      const authorMock = faker.internet.userName();

      await resolver.getPostsPage(paginationArgsMock, authorMock);

      expect(postsServiceMock.getPostsPagePage).toBeCalledTimes(1);
      expect(postsServiceMock.getPostsPagePage).toBeCalledWith(
        paginationArgsMock,
        authorMock,
      );
    });
  });

  describe('findOne resolver', () => {
    it('should call correct service methods with correct params and throw not found error', async () => {
      const id = faker.datatype.uuid();

      await expect(resolver.findOne(id)).rejects.toThrowError(
        NotFoundException,
      );

      expect(postsServiceMock.findOne).toBeCalledTimes(1);
      expect(postsServiceMock.findOne).toBeCalledWith(id);
    });

    it('should call correct service methods with correct params and return post', async () => {
      const id = faker.datatype.uuid();
      const post = new Post();
      post.id = id;
      postsServiceMock.findOne.mockResolvedValueOnce(post);

      const resp = await resolver.findOne(id);

      expect(postsServiceMock.findOne).toBeCalledTimes(1);
      expect(postsServiceMock.findOne).toBeCalledWith(id);
      expect(resp).toBe(post);
    });
  });

  describe('profile resolver', () => {
    it('should call correct service methods with correct params', async () => {
      const post: Partial<Post> = {
        authorUsername: faker.internet.userName(),
      };

      await resolver.profile(<any>post);

      expect(profilesLoaderMock.batchProfiles.load).toBeCalledTimes(1);
      expect(profilesLoaderMock.batchProfiles.load).toBeCalledWith(
        post.authorUsername,
      );
    });
  });

  describe('updatePost resolver', () => {
    it('should call correct service methods with correct params', async () => {
      const updatePostInput: UpdatePostInput = {
        id: faker.datatype.uuid(),
      };
      const post = new Post();
      post.authorUsername = userDataMock.username;
      postsServiceMock.findOne.mockResolvedValueOnce(post);

      await resolver.updatePost(updatePostInput, userDataMock);

      expect(postsServiceMock.update).toBeCalledTimes(1);
      expect(postsServiceMock.update).toBeCalledWith(
        updatePostInput.id,
        updatePostInput,
      );
      expect(postsServiceMock.findOne).toBeCalledTimes(1);
      expect(postsServiceMock.findOne).toBeCalledWith(updatePostInput.id);
    });

    it('should throw forbidden exception when trying to change other user post', async () => {
      const updatePostInput: UpdatePostInput = {
        id: faker.datatype.uuid(),
      };
      const post = new Post();
      post.authorUsername = faker.internet.userName();
      postsServiceMock.findOne.mockResolvedValueOnce(post);

      await expect(
        resolver.updatePost(updatePostInput, userDataMock),
      ).rejects.toThrowError(ForbiddenException);

      expect(postsServiceMock.update).toBeCalledTimes(0);
      expect(postsServiceMock.findOne).toBeCalledTimes(1);
      expect(postsServiceMock.findOne).toBeCalledWith(updatePostInput.id);
    });
  });

  describe('removePost resolver', () => {
    it('should call correct service methods with correct params', async () => {
      const id = faker.datatype.uuid();
      const post = new Post();
      post.authorUsername = userDataMock.username;
      postsServiceMock.findOne.mockResolvedValueOnce(post);

      const resp = await resolver.removePost(id, userDataMock);

      expect(postsServiceMock.remove).toBeCalledTimes(1);
      expect(postsServiceMock.remove).toBeCalledWith(id);
      expect(postsServiceMock.findOne).toBeCalledTimes(1);
      expect(postsServiceMock.findOne).toBeCalledWith(id);
    });

    it('should throw forbidden exception when trying to change other user post', async () => {
      const id = faker.datatype.uuid();
      const post = new Post();
      post.authorUsername = faker.internet.userName();
      postsServiceMock.findOne.mockResolvedValueOnce(post);

      await expect(resolver.removePost(id, userDataMock)).rejects.toThrowError(
        ForbiddenException,
      );

      expect(postsServiceMock.update).toBeCalledTimes(0);
      expect(postsServiceMock.findOne).toBeCalledTimes(1);
      expect(postsServiceMock.findOne).toBeCalledWith(id);
    });
  });
});
