import { forwardRef, Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesResolver } from './profiles.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesRepository } from './repositories/profiles.repository';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';
import ProfilesLoader from './profiles.loader';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfilesRepository]),
    forwardRef(() => UsersModule),
    forwardRef(() => PostsModule),
    forwardRef(() => ProfilesModule),
  ],
  providers: [ProfilesResolver, ProfilesService, ProfilesLoader],
  exports: [ProfilesLoader],
})
export class ProfilesModule {}
