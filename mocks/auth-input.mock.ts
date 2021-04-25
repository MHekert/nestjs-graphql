import { AuthInput } from '../src/modules/auth/dto/auth.input';
import { usernameMock } from './username.mock';
import * as faker from 'faker';

export const authInputMock: AuthInput = {
  username: usernameMock,
  password: faker.internet.password(),
};
