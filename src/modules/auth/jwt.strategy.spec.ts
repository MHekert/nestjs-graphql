import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { configServiceMock } from '../../../mocks/config-service.mock';
import { usernameMock } from '../../../mocks/username.mock';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let provider: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    provider = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('validate should return object in correct format', async () => {
    const payload = {
      sub: usernameMock,
    };

    const resp = await provider.validate(payload);

    expect(resp).toMatchObject({
      username: usernameMock,
    });
  });
});
