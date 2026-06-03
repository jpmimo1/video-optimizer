import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { R2Service } from 'src/r2/r2.service';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';
import { ConvertSettings, FfmpegService } from './ffmpeg/ffmpeg.service';
import { JobStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Processor('video-processing-queue')
export class VideoProcessor extends WorkerHost {
  constructor(
    private readonly r2Service: R2Service,
    private readonly ffmpegService: FfmpegService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
    console.log(`\n👷‍♂️ [Worker] New job received! ID: ${job.id}`);

    const { fileKey, settings, jobId } = job.data as {
      fileKey: string;
      settings: Prisma.InputJsonValue;
      jobId: string;
    };

    if (!fileKey) {
      throw new Error('Job does not contain a valid fileKey');
    }

    const inputFileName = `input-${job.id}.mp4`;

    const localInputPath = path.join(os.tmpdir(), inputFileName);

    let localOutputPath = '';

    try {
      await this.prisma.job.update({
        where: { id: jobId },
        data: { status: JobStatus.PROCESSING },
      });

      console.log(`⏳ [Worker] Downloading ${fileKey} from R2...`);
      await this.r2Service.downloadVideo(fileKey, localInputPath);
      console.log(`✅ [Worker] Download completed.`);

      let ext = 'mp4';
      const settingsObj = (settings as ConvertSettings) || {};

      if (job.name === 'CONVERT' && settingsObj.format) {
        ext = settingsObj.format;
      } else if (job.name === 'THUMBNAIL') {
        ext = 'jpg';
      }

      const outputFileName = `output-${job.id}.${ext}`;
      localOutputPath = path.join(os.tmpdir(), outputFileName);

      console.log(`⚙️ [Worker] Executing task: ${job.name}`);

      const updateProgress = (percent: number) => {
        job.updateProgress(percent).catch((err) => {
          console.error(
            `⚠️ Error saving progress to Redis:`,
            (err as Error).message,
          );
        });
      };

      switch (job.name) {
        case 'COMPRESS':
          await this.ffmpegService.compressVideo(
            localInputPath,
            localOutputPath,
            settings,
            updateProgress,
          );
          break;
        case 'CONVERT':
          await this.ffmpegService.convertVideo(
            localInputPath,
            localOutputPath,
            updateProgress,
          );
          break;
        case 'TRIM':
          await this.ffmpegService.trimVideo(
            localInputPath,
            localOutputPath,
            settings,
            updateProgress,
          );
          break;
        case 'THUMBNAIL':
          await this.ffmpegService.extractThumbnail(
            localInputPath,
            localOutputPath,
            settings,
            updateProgress,
          );
          break;
        default:
          throw new Error(`Unknown task type: ${job.name}`);
      }

      const outputStats = await fs.stat(localOutputPath);
      const sizeProcessed = outputStats.size;
      console.log(`📊 [Worker] Final processed size: ${sizeProcessed} bytes`);

      const mimeType = job.name === 'THUMBNAIL' ? 'image/jpeg' : `video/${ext}`;
      const outputKey = await this.r2Service.uploadProcessedVideo(
        localOutputPath,
        outputFileName,
        mimeType,
      );

      await this.prisma.job.update({
        where: { id: job.id },
        data: {
          status: JobStatus.COMPLETED,
          outputUrl: outputKey,
          sizeProcessed: sizeProcessed,
        },
      });

      console.log(
        `✅ [Worker] Job completed successfully. Final path: ${outputKey}`,
      );
      return { success: true, processedPath: outputKey };
    } catch (error) {
      console.error(`❌ [Worker] Critical error in job ${job.id}:`, error);

      await this.prisma.job
        .update({
          where: { id: jobId },
          data: { status: JobStatus.FAILED },
        })
        .catch(() => null);

      throw error;
    } finally {
      // Crucial disk cleanup: Always executes regardless of success or failure.
      console.log(`🧹 [Worker] Cleaning up temporary files from disk...`);
      // Silent catch prevents worker crashes if files were never created (e.g., download failed)
      await fs.unlink(localInputPath).catch(() => null);
      await fs.unlink(localOutputPath).catch(() => null);
      console.log(`✨ [Worker] Hard drive space freed.\n`);
    }
  }
}
