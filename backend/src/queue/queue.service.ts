import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JobType } from '@prisma/client';
import { JobProgress, Queue, QueueEvents } from 'bullmq';
import { Observable } from 'rxjs';

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);
  private queueEvents!: QueueEvents;

  constructor(
    @InjectQueue('video-processing-queue') private readonly videoQueue: Queue,
  ) {}

  async onModuleInit() {
    const connection = await this.videoQueue.client;
    this.queueEvents = new QueueEvents('video-processing-queue', {
      connection,
    });
    this.logger.log('📡 QueueEvents listener initialized.');
  }

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

  streamJobProgress(jobId: string): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      const onProgress = ({
        jobId: eventJobId,
        data,
      }: {
        jobId: string;
        data: JobProgress;
      }) => {
        if (eventJobId === jobId) {
          subscriber.next({
            data: { status: 'PROCESSING', progress: Number(data) },
          } as MessageEvent);
        }
      };

      const onCompleted = ({ jobId: eventJobId }) => {
        if (eventJobId === jobId) {
          subscriber.next({
            data: { status: 'COMPLETED', progress: 100 },
          } as MessageEvent);
          subscriber.complete();
        }
      };

      const onFailed = ({ jobId: eventJobId, failedReason }: any) => {
        if (eventJobId === jobId) {
          subscriber.next({
            data: {
              status: 'FAILED',
              progress: 0,
              error: failedReason as string,
            },
          } as MessageEvent);
          subscriber.complete();
        }
      };

      this.queueEvents.on('progress', onProgress);
      this.queueEvents.on('completed', onCompleted);
      this.queueEvents.on('failed', onFailed);

      return () => {
        this.queueEvents.off('progress', onProgress);
        this.queueEvents.off('completed', onCompleted);
        this.queueEvents.off('failed', onFailed);
      };
    });
  }
}
