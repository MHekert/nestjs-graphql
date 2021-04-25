import { Injectable } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { User } from './entities/user.entity';
import { UpdateResult } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  create(username: string, hash: string): Promise<User> {
    return this.usersRepository.createUser(username, hash);
  }

  getUserByUserName(username: string): Promise<User> {
    return this.usersRepository.findOne({
      username,
    });
  }

  setHash(username: string, hash: string): Promise<UpdateResult> {
    return this.usersRepository.setHash(username, hash);
  }

  findByUsernames(usernames: string[]) {
    return this.usersRepository.findByIds(usernames);
  }
}
