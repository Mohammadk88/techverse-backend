import { Module } from '@nestjs/common';
import { FollowController } from './follow.controller';
import { FollowService } from './follow.service';
import { DatabaseModule } from '../database/database.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [DatabaseModule, WalletModule],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}
