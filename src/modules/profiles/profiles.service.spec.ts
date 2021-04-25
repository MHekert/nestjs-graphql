import { Test, TestingModule } from '@nestjs/testing';
import { PartialMockObject } from '../../../mocks/mock-types';
import { userDataMock } from '../../../mocks/user-data.mock';
import { usernameMock } from '../../../mocks/username.mock';
import { UpsertProfileInput } from './dto/upsert-profile.input';
import { ProfilesService } from './profiles.service';
import { ProfilesRepository } from './repositories/profiles.repository';
import * as faker from 'faker';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let profilesRepositoryMock: PartialMockObject<ProfilesRepository>;

  beforeEach(async () => {
    profilesRepositoryMock = {
      createProfile: jest.fn(),
      findOne: jest.fn(),
      findByIds: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: ProfilesRepository,
          useValue: profilesRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create method', () => {
    it('should call correct repository method', () => {
      const upsertProfileInput = new UpsertProfileInput();
      upsertProfileInput.bio = usernameMock;

      service.create(upsertProfileInput, userDataMock.username);

      expect(profilesRepositoryMock.createProfile).toBeCalledTimes(1);
      expect(profilesRepositoryMock.createProfile).toBeCalledWith(
        userDataMock.username,
        upsertProfileInput.bio,
      );
    });
  });

  describe('findOne method', () => {
    it('should call correct repository method', () => {
      service.findOne(usernameMock);

      expect(profilesRepositoryMock.findOne).toBeCalledTimes(1);
      expect(profilesRepositoryMock.findOne).toBeCalledWith({
        username: usernameMock,
      });
    });
  });

  describe('findByUsernames method', () => {
    it('should call correct repository method', () => {
      const usernames = [faker.internet.userName(), faker.internet.userName()];
      service.findByUsernames(usernames);

      expect(profilesRepositoryMock.findByIds).toBeCalledTimes(1);
      expect(profilesRepositoryMock.findByIds).toBeCalledWith(usernames);
    });
  });
});
