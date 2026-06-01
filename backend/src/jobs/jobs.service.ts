import 'multer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from 'src/queue/queue.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JobStatus, Prisma } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  async create(file: Express.Multer.File, dto: CreateJobDto) {
    try {
      const settingsParams = dto.settings
        ? (JSON.parse(dto.settings) as Prisma.InputJsonValue)
        : {};

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Note: In a production environment using the Pre-signed URL pattern,
      // the file would already be in R2. For this local MVP, the Worker
      // will read the file directly, so we store the buffer or simulate the inputUrl.
      const newJob = await this.prisma.job.create({
        data: {
          status: JobStatus.PENDING,
          type: dto.type,
          originalName: file.originalname,
          sizeOriginal: file.size,
          // Added to satisfy the mandatory inputUrl field in the Prisma schema
          inputUrl: 'local-buffer',
          settings: settingsParams,
          expiresAt: expiresAt,
        },
      });

      // Pass the file buffer to the worker for FFmpeg processing
      // (In the future, this will be replaced by an R2 download URL)
      await this.queueService.addVideoJob(newJob.id, newJob.type, {
        originalName: file.originalname,
        settings: settingsParams,
        fileBuffer: file.buffer,
      });

      return {
        id: newJob.id,
        status: newJob.status,
        type: newJob.type,
        originalName: newJob.originalName,
        sizeOriginal: file.size,
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
}
