import { EntityRepository, Repository } from 'typeorm';
import { Profile } from '../entities/profile.entity';

@EntityRepository(Profile)
export class ProfilesRepository extends Repository<Profile> {
  createProfile(username: string, bio: string): Promise<Profile> {
    return this.create({
      username,
      bio,
    }).save();
  }
}
