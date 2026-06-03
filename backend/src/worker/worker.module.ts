import { Module } from '@nestjs/common';
import { VideoProcessor } from './video.processor';
import { R2Module } from 'src/r2/r2.module';
import { FfmpegService } from './ffmpeg/ffmpeg.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './cleanup.service';

@Module({
  providers: [VideoProcessor, FfmpegService, CleanupService],
  imports: [R2Module, PrismaModule, ScheduleModule.forRoot()],
})
export class WorkerModule {}
