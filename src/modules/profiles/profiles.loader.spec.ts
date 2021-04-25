import { Test, TestingModule } from '@nestjs/testing';
import { PartialMockObject } from '../../../mocks/mock-types';
import ProfilesLoader from './profiles.loader';
import { ProfilesService } from './profiles.service';
import * as faker from 'faker';
import { Profile } from './entities/profile.entity';

describe('ProfilesLoader', () => {
  let loader: ProfilesLoader;
  let profilesServiceMock: PartialMockObject<ProfilesService>;

  beforeEach(async () => {
    profilesServiceMock = {
      findByUsernames: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesLoader,
        {
          provide: ProfilesService,
          useValue: profilesServiceMock,
        },
      ],
    }).compile();

    loader = await module.resolve<ProfilesLoader>(ProfilesLoader);
  });

  it('should be defined', () => {
    expect(loader).toBeDefined();
  });

  describe('batchesProfiles', () => {
    it('should call correct methods', async () => {
      const profile1 = new Profile();
      profile1.username = faker.internet.userName();
      const profile2 = new Profile();
      profile2.username = faker.internet.userName();

      const usernames = [profile1.username, profile2.username];

      profilesServiceMock.findByUsernames.mockResolvedValueOnce([
        profile1,
        profile2,
      ]);

      const resp = await loader.batchProfiles.loadMany(usernames);

      expect(profilesServiceMock.findByUsernames).toBeCalledTimes(1);
      expect(profilesServiceMock.findByUsernames).toBeCalledWith(usernames);
      expect(resp).toStrictEqual([profile1, profile2]);
    });
  });
});
