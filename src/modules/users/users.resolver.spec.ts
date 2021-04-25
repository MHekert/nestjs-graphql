import { Test, TestingModule } from '@nestjs/testing';
import { PartialMockObject } from '../../../mocks/mock-types';
import { userDataMock } from '../../../mocks/user-data.mock';
import { usernameMock } from '../../../mocks/username.mock';
import ProfilesLoader from '../profiles/profiles.loader';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let profilesLoaderMock: PartialMockObject<ProfilesLoader>;

  beforeEach(async () => {
    profilesLoaderMock = {
      batchProfiles: <any>{
        load: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        {
          provide: ProfilesLoader,
          useValue: profilesLoaderMock,
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getLoggedUser resolver', () => {
    it('should return logged user', () => {
      const resp = resolver.getLoggedUser(userDataMock);

      expect(resp).toBe(userDataMock);
    });
  });

  describe('profile resolver', () => {
    it('should call correct method', () => {
      const user = new User();
      user.username = usernameMock;

      resolver.profile(user);

      expect(profilesLoaderMock.batchProfiles.load).toBeCalledTimes(1);
      expect(profilesLoaderMock.batchProfiles.load).toBeCalledWith(
        user.username,
      );
    });
  });
});
