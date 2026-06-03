import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  // In production, running this every hour is optimal
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredJobs() {
    this.logger.log('🧹 Starting scan for expired videos...');

    const now = new Date();

    const expiredJobs = await this.prisma.job.findMany({
      where: {
        expiresAt: {
          lte: now,
        },
        status: {
          not: 'EXPIRED',
        },
      },
    });

    if (expiredJobs.length === 0) {
      this.logger.log('✨ No expired videos found. Everything is clean.');
      return;
    }

    this.logger.log(
      `🗑️ Found ${expiredJobs.length} expired videos. Deleting...`,
    );

    for (const job of expiredJobs) {
      try {
        if (job.inputUrl) {
          await this.r2Service.deleteFile(job.inputUrl);
        }

        if (job.outputUrl) {
          await this.r2Service.deleteFile(job.outputUrl);
        }

        // We update the status to 'EXPIRED' instead of deleting the DB record to keep the history
        await this.prisma.job.update({
          where: { id: job.id },
          data: { status: 'EXPIRED' },
        });

        this.logger.log(`✅ Job ${job.id} and its physical files were purged.`);
      } catch (error) {
        this.logger.error(`❌ Error purging Job ${job.id}:`, error);
      }
    }
  }
}
