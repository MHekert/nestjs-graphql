import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './repositories/users.repository';
import { ProfilesModule } from '../profiles/profiles.module';
import UsersLoader from './users.loader';

@Module({
  imports: [TypeOrmModule.forFeature([UsersRepository]), ProfilesModule],
  providers: [UsersResolver, UsersService, UsersLoader],
  exports: [UsersService, UsersLoader],
})
export class UsersModule {}
