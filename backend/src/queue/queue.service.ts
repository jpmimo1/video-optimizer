import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { JobType } from '@prisma/client';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('video-processing-queue') private readonly videoQueue: Queue,
  ) {}

  /**
   * Adds a new job to the processing queue.
   * @param jobId The ID of the Job stored in the database.
   * @param type The type of operation (COMPRESS, TRIM, etc.).
   * @param payload The necessary data for the Worker to process the video.
   */
  async addVideoJob(jobId: string, type: JobType, payload: any): Promise<void> {
    try {
      await this.videoQueue.add(
        type,
        {
          jobId,
          ...payload,
        },
        { jobId: jobId },
      );

      this.logger.log(`✅ Job ${jobId} [${type}] successfully added to queue.`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to add Job ${jobId} to queue: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
