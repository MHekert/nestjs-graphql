import { AuthLocalGuard } from './auth-local.guard';

describe('AuthLocalGuard', () => {
  it('should be defined', () => {
    expect(new AuthLocalGuard()).toBeDefined();
  });
});
