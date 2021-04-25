import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../src/modules/auth/jwt.strategy';
import { User } from '../../src/modules/users/entities/user.entity';
import { sign } from 'jsonwebtoken';
import { classToPlain } from 'class-transformer';

export const getAccessToken = async (user: User, cfg: ConfigService) => {
  const payload = new JwtPayload();
  payload.sub = user.username;

  return sign(classToPlain(payload), cfg.get('JWT_SECRET'));
};
