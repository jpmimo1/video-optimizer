import 'multer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from 'src/queue/queue.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JobStatus, Prisma } from '@prisma/client';
import { R2Service } from 'src/r2/r2.service';
import { Observable } from 'rxjs';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
    private readonly r2Service: R2Service,
  ) {}

  async create(dto: CreateJobDto) {
    try {
      const settingsParams = dto.settings
        ? (JSON.parse(dto.settings) as Prisma.InputJsonValue)
        : {};

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const newJob = await this.prisma.job.create({
        data: {
          status: JobStatus.PENDING,
          type: dto.type,
          originalName: dto.fileKey.split('/').pop() || 'video.mp4',
          sizeOriginal: dto.fileSize,
          inputUrl: dto.fileKey,
          settings: settingsParams,
          expiresAt: expiresAt,
        },
      });

      await this.queueService.addVideoJob(newJob.id, newJob.type, {
        originalName: newJob.originalName,
        settings: settingsParams,
        fileKey: dto.fileKey,
      });

      return {
        id: newJob.id,
        status: newJob.status,
        type: newJob.type,
        originalName: newJob.originalName,
        sizeOriginal: newJob.sizeOriginal,
        createdAt: newJob.createdAt,
        expiresAt: newJob.expiresAt,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to create processing job.',
      );
    }
  }

  async generateUploadUrl(fileName: string, mimeType: string) {
    return this.r2Service.getUploadPresignedUrl(fileName, mimeType);
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return null;
    }

    const publicBaseUrl = process.env.R2_PUBLIC_URL || '';

    // Construct the full playback URL only if the job completed successfully
    let downloadUrl: string | null = null;
    if (job.status === 'COMPLETED' && job.outputUrl) {
      // Prevent double slash (/) issues when concatenating the URL
      const cleanBaseUrl = publicBaseUrl.endsWith('/')
        ? publicBaseUrl.slice(0, -1)
        : publicBaseUrl;
      downloadUrl = `${cleanBaseUrl}/${job.outputUrl}`;
    }

    // Return a mapped record to protect the internal database structure
    return {
      id: job.id,
      status: job.status,
      type: job.type,
      originalName: job.originalName,
      sizeOriginal: job.sizeOriginal,
      createdAt: job.createdAt,
      expiresAt: job.expiresAt,
      videoUrl: downloadUrl,
    };
  }

  streamJobProgress(jobId: string): Observable<MessageEvent> {
    return this.queueService.streamJobProgress(jobId);
  }
}
