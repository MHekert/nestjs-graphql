import { Test, TestingModule } from '@nestjs/testing';
import { PartialMockObject } from '../../../mocks/mock-types';
import { usernameMock } from '../../../mocks/username.mock';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './users.service';
import * as faker from 'faker';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepositoryMock: PartialMockObject<UsersRepository>;

  beforeEach(async () => {
    usersRepositoryMock = {
      findOne: jest.fn(),
      setHash: jest.fn(),
      createUser: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: usersRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create method', () => {
    it('should call correct repository method', () => {
      const hash = faker.random.alphaNumeric();

      service.create(usernameMock, hash);

      expect(usersRepositoryMock.createUser).toBeCalledTimes(1);
      expect(usersRepositoryMock.createUser).toBeCalledWith(usernameMock, hash);
    });
  });

  describe('getUserByUserName method', () => {
    it('should call correct repository method', () => {
      service.getUserByUserName(usernameMock);

      expect(usersRepositoryMock.findOne).toBeCalledTimes(1);
      expect(usersRepositoryMock.findOne).toBeCalledWith({
        username: usernameMock,
      });
    });
  });

  describe('create method', () => {
    it('should call correct repository method', () => {
      const hash = faker.random.alphaNumeric();

      service.setHash(usernameMock, hash);

      expect(usersRepositoryMock.setHash).toBeCalledTimes(1);
      expect(usersRepositoryMock.setHash).toBeCalledWith(usernameMock, hash);
    });
  });
});
