import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { authInputMock } from '../../../mocks/auth-input.mock';
import { PartialMockObject } from '../../../mocks/mock-types';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import * as faker from 'faker';

describe('LocalStrategy', () => {
  let provider: LocalStrategy;
  let authServiceMock: PartialMockObject<AuthService>;

  beforeEach(async () => {
    authServiceMock = {
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    provider = module.get<LocalStrategy>(LocalStrategy);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('validate method', () => {
    it('should throw unauthorized exception when user not validated', async () => {
      await expect(
        provider.validate(authInputMock.username, authInputMock.password),
      ).rejects.toThrowError(UnauthorizedException);

      expect(authServiceMock.validateUser).toBeCalledTimes(1);
      expect(authServiceMock.validateUser).toBeCalledWith(
        authInputMock.username,
        authInputMock.password,
      );
    });

    it('should return user object without hash when user validated', async () => {
      const user = new User();
      user.username = authInputMock.username;
      user.hash = faker.random.alpha();

      authServiceMock.validateUser.mockResolvedValueOnce(user);

      const resp = await provider.validate(
        authInputMock.username,
        authInputMock.password,
      );

      expect(authServiceMock.validateUser).toBeCalledTimes(1);
      expect(authServiceMock.validateUser).toBeCalledWith(
        authInputMock.username,
        authInputMock.password,
      );
      expect(resp).toHaveProperty('username', authInputMock.username);
      expect(resp).not.toHaveProperty('hash');
    });
  });
});
