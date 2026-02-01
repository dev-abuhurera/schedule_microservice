import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as cron from 'node-cron';
import { JobFactory } from './job-factory';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    this.logger.log('Scheduler Service Initialized');
    this.startScheduler();
  }

  private startScheduler() {
    // Run every minute to check for jobs
    cron.schedule('* * * * *', async () => {
      await this.checkAndRunJobs();
    });
    
    this.logger.log('Scheduler started - checking jobs every minute');
  }

  private async checkAndRunJobs() {
    
    try {
      // Get all active jobs
      const jobs = await this.prisma.job.findMany({
        where: { isActive: true },
      });

      const now = new Date();

      for (const job of jobs) {
        const shouldRun = this.shouldJobRun(job, now);
        
        if (shouldRun) {
          this.logger.log(`Running job: ${job.name} (ID: ${job.id})`);
          await this.executeJob(job.id, job.name, job.schedule);
        }
      }
    } catch (error) {
      this.logger.error('Error checking jobs:', error);
    }
  }

  private shouldJobRun(job: any, now: Date): boolean {

    if (!job.lastRun) {
      return true;
    }

    // If nextRun is set and it's time
    if (job.nextRun && now >= job.nextRun) {
      return true;
    }

    // Check if enough time has passed based on schedule
    const cronExpression = job.schedule;
    
    try {
      if (cron.validate(cronExpression)) {
        // Calculate if job should run based on cron
        return this.shouldRunBasedOnCron(job.lastRun, now, cronExpression);
      }
    } catch (error) {
      this.logger.error(`Invalid cron expression for job ${job.id}: ${cronExpression}`);
    }

    return false;
  }

  private shouldRunBasedOnCron(lastRun: Date, now: Date, cronExpression: string): boolean {
    const minutesSinceLastRun = (now.getTime() - new Date(lastRun).getTime()) / 1000 / 60; // for now we are checking it as it runs in one second
    return minutesSinceLastRun >= 1;
  }

  private async executeJob(jobId: number, jobName: string, schedule: string) {
    
    try {
      const startTime = new Date();
      const jobExecutor = JobFactory.createJob(jobName);
      await jobExecutor.execute(jobId, jobName);
      const nextRun = this.calculateNextRun(schedule);
      
      await this.prisma.job.update({
        where: { id: jobId },
        data: {
          lastRun: startTime,
          nextRun: nextRun,
        },
      });
      
      this.logger.log(`Job ${jobId} completed. Next run: ${nextRun}`);
    } catch (error) {
      this.logger.error(`Error executing job ${jobId}:`, error);
    }

  }

  private calculateNextRun(cronExpression: string): Date {

    const now = new Date(); // we will calculate it from the most common pattern
    
    // Parse common patterns
    if (cronExpression === '* * * * *') {
        // for every minute
      return new Date(now.getTime() + 60 * 1000);
    } 
    else if (cronExpression === '0 * * * *') {
      // Every hour
      return new Date(now.getTime() + 60 * 60 * 1000);
    }
     else if (cronExpression === '0 0 * * *') {
      // Every day at midnight
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow;
    } 
    else if (cronExpression === '0 9 * * *') {
      const next9AM = new Date(now);
      next9AM.setHours(9, 0, 0, 0);
      
      // If it's already past 9 AM today, schedule for tomorrow
      if (now.getHours() >= 9) {
        next9AM.setDate(next9AM.getDate() + 1);
      }
      return next9AM;
    }
     else {
      // Default: 1 hour from now
      return new Date(now.getTime() + 60 * 60 * 1000);
    }
  }

}