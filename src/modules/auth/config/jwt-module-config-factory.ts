import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtModuleConfigFactory = (
  cfg: ConfigService,
): JwtModuleOptions => ({
  secret: cfg.get('JWT_SECRET'),
  signOptions: {
    expiresIn: cfg.get('JWT_EXPIRES_IN'),
  },
});
