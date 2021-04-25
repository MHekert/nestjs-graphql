import { ConfigService } from '@nestjs/config';
import { PartialMockObject } from './mock-types';

export const configServiceMock: PartialMockObject<ConfigService> = {
  get: jest.fn().mockImplementation((arg: string) => arg),
};
