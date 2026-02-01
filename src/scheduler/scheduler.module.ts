import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [SchedulerService, PrismaService],
  exports: [SchedulerService],
})
export class SchedularModule {}
