import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async createUser(username: string, hash: string): Promise<User> {
    return this.create({
      username,
      hash,
    }).save();
  }

  setHash(username: string, hash: string) {
    return this.update({ username }, { hash });
  }
}
