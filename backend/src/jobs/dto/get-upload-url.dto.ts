import { IsNotEmpty, IsNumber, IsString, Max } from 'class-validator';

export class GetUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsNumber()
  @IsNotEmpty()
  @Max(104857600, { message: 'File cannot exceed 100 Megabytes.' }) // 100 * 1024 * 1024 bytes
  fileSize!: number;
}
