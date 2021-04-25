import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { ProfilesService } from './profiles.service';

@Injectable({ scope: Scope.REQUEST })
export default class ProfilesLoader {
  constructor(private profilesService: ProfilesService) {}

  public readonly batchProfiles = new DataLoader(
    async (profilesUsernames: string[]) => {
      const profiles = await this.profilesService.findByUsernames(
        profilesUsernames,
      );
      const profilesMap = new Map(
        profiles.map((profile) => [profile.username, profile]),
      );

      return profilesUsernames.map((profileId) => profilesMap.get(profileId));
    },
  );
}
