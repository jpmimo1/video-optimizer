import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateJobDto } from './dto/create-job.dto';

@Controller('api/v1/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FileInterceptor('file'))
  async createJob(
    @UploadedFile() file: Express.Multer.File,
    @Body() createJobDto: CreateJobDto,
  ) {
    if (!file) {
      throw new BadRequestException('Video file is required.');
    }

    // Strict size validation (100 MB)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File exceeds the 100MB maximum limit.');
    }

    return this.jobsService.create(file, createJobDto);
  }
}
