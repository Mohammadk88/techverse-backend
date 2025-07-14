import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { AuthModule } from '../auth/auth.module';
import { AIModule } from '../ai/ai.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [AuthModule, AIModule, CommonModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
