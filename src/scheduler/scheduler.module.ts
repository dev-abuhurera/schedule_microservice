import { Module } from '@nestjs/common';
import { SchedularService } from './scheduler.service';

@Module({
  providers: [SchedularService]
})
export class SchedularModule {}
