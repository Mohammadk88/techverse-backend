import { Module } from '@nestjs/common';
import { AIKeysController } from './ai-keys.controller';
import { AIKeysService } from './ai-keys.service';

@Module({
  controllers: [AIKeysController],
  providers: [AIKeysService],
  exports: [AIKeysService],
})
export class AIKeysModule {}
