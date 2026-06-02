import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { JobsModule } from './jobs/jobs.module';
import { R2Module } from './r2/r2.module';
import { WorkerModule } from './worker/worker.module';

const processType = process.env.PROCESS_TYPE || 'API';
@Module({
  imports: [
    PrismaModule,
    QueueModule,
    JobsModule,
    R2Module,
    WorkerModule,
    ...(processType === 'WORKER' ? [WorkerModule] : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
