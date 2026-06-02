import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { JobType } from '@prisma/client';

export class CreateJobDto {
  @IsEnum(JobType)
  @IsNotEmpty()
  type!: JobType;

  @IsString()
  @IsNotEmpty()
  fileKey!: string; // Key generated during the pre-signed URL upload phase

  @IsNumber()
  @IsNotEmpty()
  fileSize!: number; // File size in bytes

  @IsString()
  @IsOptional()
  settings?: string;
}
