import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { GetUploadUrlDto } from './dto/get-upload-url.dto';

@Controller('api/v1/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async createJob(@Body() createJobDto: CreateJobDto) {
    console.log(createJobDto);
    return this.jobsService.create(createJobDto);
  }

  @Post('upload-url')
  async getUploadUrl(@Body() dto: GetUploadUrlDto) {
    return this.jobsService.generateUploadUrl(dto.fileName, dto.mimeType);
  }

  @Get(':id')
  async getJobStatus(@Param('id', new ParseUUIDPipe()) id: string) {
    const job = await this.jobsService.findOne(id);

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found.`);
    }

    return job;
  }
}
