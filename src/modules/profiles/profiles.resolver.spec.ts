import { Test, TestingModule } from '@nestjs/testing';
import { PartialMockObject } from '../../../mocks/mock-types';
import { usernameMock } from '../../../mocks/username.mock';
import { PostsService } from '../posts/posts.service';
import { UpsertProfileInput } from './dto/upsert-profile.input';
import { ProfilesResolver } from './profiles.resolver';
import { ProfilesService } from './profiles.service';
import * as faker from 'faker';
import { Profile } from './entities/profile.entity';
import { PaginationArgs } from '../../common/dto/pagination.args';
import ProfilesLoader from './profiles.loader';
import UsersLoader from '../users/users.loader';
import { userDataMock } from '../../../mocks/user-data.mock';

describe('ProfilesResolver', () => {
  let resolver: ProfilesResolver;
  let profilesServiceMock: PartialMockObject<ProfilesService>;
  let postsServiceMock: PartialMockObject<PostsService>;
  let profilesLoaderMock: PartialMockObject<ProfilesLoader>;
  let usersLoaderMock: PartialMockObject<UsersLoader>;

  beforeEach(async () => {
    profilesServiceMock = {
      create: jest.fn(),
    };
    postsServiceMock = {
      getPostsPagePage: jest.fn(),
    };
    profilesLoaderMock = {
      batchProfiles: <any>{
        load: jest.fn(),
      },
    };
    usersLoaderMock = {
      batchUsers: <any>{
        load: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesResolver,
        {
          provide: ProfilesService,
          useValue: profilesServiceMock,
        },
        {
          provide: ProfilesLoader,
          useValue: profilesLoaderMock,
        },
        {
          provide: UsersLoader,
          useValue: usersLoaderMock,
        },
        {
          provide: PostsService,
          useValue: postsServiceMock,
        },
      ],
    }).compile();

    resolver = module.get<ProfilesResolver>(ProfilesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('upsertProfile resolver', () => {
    it('should call correct methods with correct parameters', () => {
      const upsertProfileInput: UpsertProfileInput = {
        bio: faker.random.alphaNumeric(),
      };

      resolver.upsertProfile(upsertProfileInput, userDataMock);

      expect(profilesServiceMock.create).toBeCalledTimes(1);
      expect(profilesServiceMock.create).toBeCalledWith(
        upsertProfileInput,
        userDataMock.username,
      );
    });
  });

  describe('findOne resolver', () => {
    it('should call correct methods with correct parameters', () => {
      resolver.findOne(usernameMock);

      expect(profilesLoaderMock.batchProfiles.load).toBeCalledTimes(1);
      expect(profilesLoaderMock.batchProfiles.load).toBeCalledWith(
        usernameMock,
      );
    });
  });

  describe('profile resolver', () => {
    it('should call correct methods with correct parameters', () => {
      const profile = new Profile();
      profile.bio = faker.random.alphaNumeric();
      profile.username = usernameMock;

      resolver.profile(profile);

      expect(usersLoaderMock.batchUsers.load).toBeCalledTimes(1);
      expect(usersLoaderMock.batchUsers.load).toBeCalledWith(profile.username);
    });
  });

  describe('posts resolver', () => {
    it('should call correct methods with correct parameters', async () => {
      const profile = new Profile();
      profile.bio = faker.random.alphaNumeric();
      profile.username = usernameMock;

      const paginationArgs = new PaginationArgs();
      paginationArgs.limit = 1;

      await resolver.posts(profile, paginationArgs);

      expect(postsServiceMock.getPostsPagePage).toBeCalledTimes(1);
      expect(postsServiceMock.getPostsPagePage).toBeCalledWith(
        paginationArgs,
        profile.username,
      );
    });
  });
});
