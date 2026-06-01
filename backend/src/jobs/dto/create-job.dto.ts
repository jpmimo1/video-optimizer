import { JobType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @IsEnum(JobType)
  @IsNotEmpty()
  type!: JobType;

  // Settings are received as a string (JSON) because we are using FormData
  @IsString()
  @IsOptional()
  settings?: string;
}
