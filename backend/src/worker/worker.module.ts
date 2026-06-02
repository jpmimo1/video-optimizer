import { Module } from '@nestjs/common';
import { VideoProcessor } from './video.processor';
import { R2Module } from 'src/r2/r2.module';
import { FfmpegService } from './ffmpeg/ffmpeg.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [VideoProcessor, FfmpegService],
  imports: [R2Module, PrismaModule],
})
export class WorkerModule {}
