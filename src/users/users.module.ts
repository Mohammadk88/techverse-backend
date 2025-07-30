import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RoleUpgradeService } from './role-upgrade.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, RoleUpgradeService],
  exports: [UsersService, RoleUpgradeService],
})
export class UsersModule {}
