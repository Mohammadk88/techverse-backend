import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { AuthModule } from '../auth/auth.module';
import { AIModule } from '../ai/ai.module';
import { WalletModule } from '../wallet/wallet.module';
import { ContentQueryService } from '../common/services/content-query.service';

@Module({
  imports: [AuthModule, AIModule, WalletModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, ContentQueryService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
