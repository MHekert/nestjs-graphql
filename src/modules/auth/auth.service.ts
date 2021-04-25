import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthInput } from './dto/auth.input';
import { hash, compare } from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Connection } from 'typeorm';
import { Profile } from '../profiles/entities/profile.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private connection: Connection,
  ) {}

  async signUp(authInput: AuthInput): Promise<AuthInput> {
    const { username, password } = authInput;
    const user = await this.usersService.getUserByUserName(username);
    if (user) throw new ForbiddenException();

    const passwordHash = await this.hashPassword(password);
    await this.createUserWithProfile(username, passwordHash);

    return authInput;
  }

  async generateJwt(username: string) {
    const payload = { sub: username };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.getUserByUserName(username);
    if (!user) return null;

    const doesMatch = await compare(password, user.hash);
    if (!doesMatch) return null;

    return user;
  }

  async changePassword(authInput: AuthInput): Promise<void> {
    const passwordHash = await this.hashPassword(authInput.password);

    await this.usersService.setHash(authInput.username, passwordHash);
  }

  private hashPassword(password: string): Promise<string> {
    return hash(password, 12);
  }

  private async createUserWithProfile(username, passwordHash): Promise<void> {
    const profile = new Profile();
    profile.username = username;
    const user = new User();
    user.username = username;
    user.hash = passwordHash;

    await this.connection.transaction(async (manager) => {
      await manager.save(user);
      await manager.save(profile);
    });
  }
}
