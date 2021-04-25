import { Injectable } from '@nestjs/common';
import { UpsertProfileInput } from './dto/upsert-profile.input';
import { Profile } from './entities/profile.entity';
import { ProfilesRepository } from './repositories/profiles.repository';

@Injectable()
export class ProfilesService {
  constructor(private profilesRepository: ProfilesRepository) {}

  create(
    upsertProfileInput: UpsertProfileInput,
    username: string,
  ): Promise<Profile> {
    return this.profilesRepository.createProfile(
      username,
      upsertProfileInput.bio,
    );
  }

  findOne(username: string): Promise<Profile | undefined> {
    return this.profilesRepository.findOne({ username });
  }

  findByUsernames(usernames: string[]) {
    return this.profilesRepository.findByIds(usernames);
  }
}
