import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import * as faker from 'faker';
import { PartialMockObject } from '../../../mocks/mock-types';
import { UserData } from './local.strategy';
import { ForbiddenException } from '@nestjs/common';
import { authInputMock } from '../../../mocks/auth-input.mock';
import { userDataMock } from '../../../mocks/user-data.mock';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authServiceMock: PartialMockObject<AuthService>;

  beforeEach(async () => {
    authServiceMock = {
      changePassword: jest.fn(),
      generateJwt: jest.fn(),
      signUp: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('signUp resolver', () => {
    it('should call correct methods with correct arguments', async () => {
      authServiceMock.signUp.mockResolvedValueOnce(authInputMock);

      await resolver.signUp(authInputMock);

      expect(authServiceMock.signUp).toBeCalledWith(authInputMock);
      expect(authServiceMock.signUp).toBeCalledTimes(1);
      expect(authServiceMock.generateJwt).toBeCalledWith(
        authInputMock.username,
      );
      expect(authServiceMock.generateJwt).toBeCalledTimes(1);
    });
  });

  describe('changePassword resolver', () => {
    it('should call correct methods with correct arguments', async () => {
      const resp = await resolver.changePassword(authInputMock, userDataMock);

      expect(resp).toBe(true);

      expect(authServiceMock.changePassword).toBeCalledWith(authInputMock);
      expect(authServiceMock.changePassword).toBeCalledTimes(1);
    });

    it('should throw forbidden exception when trying to change different user password', async () => {
      const differentUserData: UserData = {
        username: faker.internet.password(),
      };

      await expect(
        resolver.changePassword(authInputMock, differentUserData),
      ).rejects.toThrowError(ForbiddenException);
      expect(authServiceMock.changePassword).toBeCalledTimes(0);
    });
  });

  describe('signIn resolver', () => {
    it('should call correct methods with correct arguments', async () => {
      await resolver.signIn(authInputMock, userDataMock);

      expect(authServiceMock.generateJwt).toBeCalledWith(userDataMock.username);
      expect(authServiceMock.generateJwt).toBeCalledTimes(1);
    });
  });
});
