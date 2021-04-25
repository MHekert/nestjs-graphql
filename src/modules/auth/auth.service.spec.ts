import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcrypt';
import { Connection, EntityManager } from 'typeorm';
import { authInputMock } from '../../../mocks/auth-input.mock';
import { PartialMockObject } from '../../../mocks/mock-types';
import { usernameMock } from '../../../mocks/username.mock';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: PartialMockObject<UsersService>;
  let jwtServiceMock: PartialMockObject<JwtService>;
  let managerMock: PartialMockObject<EntityManager>;
  let connectionMock: PartialMockObject<Connection>;

  beforeEach(async () => {
    usersServiceMock = {
      create: jest.fn(),
      getUserByUserName: jest.fn(),
      setHash: jest.fn(),
    };
    jwtServiceMock = {
      sign: jest.fn(),
    };
    managerMock = {
      save: jest.fn(),
    };
    connectionMock = {
      transaction: jest.fn().mockImplementation((arg) => arg(managerMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: Connection,
          useValue: connectionMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp method', () => {
    it('should save user and profile entity with not plain text password', async () => {
      await service.signUp(authInputMock);

      expect(usersServiceMock.getUserByUserName).toBeCalledWith(
        authInputMock.username,
      );
      expect(usersServiceMock.getUserByUserName).toBeCalledTimes(1);
      expect(connectionMock.transaction).toBeCalledTimes(1);
      expect(managerMock.save).toBeCalledTimes(2);
      expect(managerMock.save.mock.calls[0][0]).toMatchObject({
        username: usernameMock,
        hash: expect.not.stringMatching(authInputMock.password),
      });
    });
  });

  describe('generateJwt method', () => {
    it('should return access token', async () => {
      const resp = await service.generateJwt(usernameMock);

      expect(jwtServiceMock.sign).toBeCalledWith({ sub: usernameMock });
      expect(jwtServiceMock.sign).toBeCalledTimes(1);
      expect(resp).toHaveProperty('accessToken');
    });
  });

  describe('validateUser method', () => {
    it('should return null when no user found', async () => {
      const resp = await service.validateUser(
        usernameMock,
        authInputMock.password,
      );

      expect(usersServiceMock.getUserByUserName).toBeCalledWith(usernameMock);
      expect(usersServiceMock.getUserByUserName).toBeCalledTimes(1);
      expect(resp).toBe(null);
    });

    it('should return null when password does not match', async () => {
      const user = new User();
      user.hash = '';
      usersServiceMock.getUserByUserName.mockResolvedValueOnce(user);
      const resp = await service.validateUser(
        usernameMock,
        authInputMock.password,
      );

      expect(usersServiceMock.getUserByUserName).toBeCalledWith(usernameMock);
      expect(usersServiceMock.getUserByUserName).toBeCalledTimes(1);
      expect(resp).toBe(null);
    });

    it('should return user object when user exists and password does match', async () => {
      const { password, username } = authInputMock;
      const passwordHash = await hash(password, 12);

      const user = new User();
      user.hash = passwordHash;
      user.username = username;

      usersServiceMock.getUserByUserName.mockResolvedValueOnce(user);
      const resp = await service.validateUser(username, password);

      expect(usersServiceMock.getUserByUserName).toBeCalledWith(username);
      expect(usersServiceMock.getUserByUserName).toBeCalledTimes(1);
      expect(resp).toBe(user);
    });
  });

  describe('changePassword method', () => {
    it('should call setHash with correct params', async () => {
      const resp = await service.changePassword(authInputMock);

      expect(usersServiceMock.setHash).toBeCalledWith(
        authInputMock.username,
        expect.any(String),
      );
      expect(usersServiceMock.setHash).toBeCalledWith(
        authInputMock.username,
        expect.not.stringMatching(authInputMock.password),
      );
      expect(usersServiceMock.setHash).toBeCalledTimes(1);
    });
  });
});
