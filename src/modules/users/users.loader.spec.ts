import { Test, TestingModule } from '@nestjs/testing';
import { PartialMockObject } from '../../../mocks/mock-types';
import UsersLoader from './users.loader';
import { UsersService } from './users.service';
import * as faker from 'faker';
import { User } from './entities/user.entity';

describe('UsersLoader', () => {
  let loader: UsersLoader;
  let usersServiceMock: PartialMockObject<UsersService>;

  beforeEach(async () => {
    usersServiceMock = {
      findByUsernames: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersLoader,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    loader = await module.resolve<UsersLoader>(UsersLoader);
  });

  it('should be defined', () => {
    expect(loader).toBeDefined();
  });

  describe('batchesUsers', () => {
    it('should call correct methods', async () => {
      const user1 = new User();
      user1.username = faker.internet.userName();
      const user2 = new User();
      user2.username = faker.internet.userName();

      const usernames = [user1.username, user2.username];

      usersServiceMock.findByUsernames.mockResolvedValueOnce([user1, user2]);

      const resp = await loader.batchUsers.loadMany(usernames);

      expect(usersServiceMock.findByUsernames).toBeCalledTimes(1);
      expect(usersServiceMock.findByUsernames).toBeCalledWith(usernames);
      expect(resp).toStrictEqual([user1, user2]);
    });
  });
});
