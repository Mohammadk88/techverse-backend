import { Module } from '@nestjs/common';
import { ContentQueryService } from './services/content-query.service';

@Module({
  providers: [ContentQueryService],
  exports: [ContentQueryService],
})
export class CommonModule {}
