import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { UsersService } from './users.service';

@Injectable({ scope: Scope.REQUEST })
export default class UsersLoader {
  constructor(private usersService: UsersService) {}

  public readonly batchUsers = new DataLoader(
    async (usersUsernames: string[]) => {
      const users = await this.usersService.findByUsernames(usersUsernames);
      const usersMap = new Map(users.map((user) => [user.username, user]));

      return usersUsernames.map((userUsername) => usersMap.get(userUsername));
    },
  );
}
