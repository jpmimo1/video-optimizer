import { Global, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bullmq';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        maxRetriesPerRequest: null,
      },
    }),
    BullModule.registerQueue({
      name: 'video-processing-queue',
    }),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
