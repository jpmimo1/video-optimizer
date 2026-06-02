import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { pipeline } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

@Injectable()
export class R2Service {
  private s3Client: S3Client;
  private bucketName = process.env.R2_BUCKET;

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY!,
        secretAccessKey: process.env.R2_SECRET_KEY!,
      },
    });
  }

  async uploadVideo(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<string> {
    try {
      // Generate a unique name to prevent collisions with identically named files
      const fileExtension = originalName.split('.').pop();
      const uniqueFileName = `input-videos/${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueFileName,
        Body: buffer,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);

      return uniqueFileName;
    } catch (error) {
      console.error('Error uploading file to R2:', error);
      throw new InternalServerErrorException('Error uploading video to R2.');
    }
  }

  async getUploadPresignedUrl(originalName: string, mimeType: string) {
    try {
      const fileExtension = originalName.split('.').pop();
      const fileKey = `input-videos/${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        ContentType: mimeType,
      });

      // URL will expire in 15 minutes (900 seconds)
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 900,
      });

      return { uploadUrl, fileKey };
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw new InternalServerErrorException('Could not generate upload URL.');
    }
  }

  async downloadVideo(fileKey: string, destinationPath: string): Promise<void> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('R2 response body is empty');
      }

      // Pipe the download stream directly to the destination file on disk
      await pipeline(
        response.Body as NodeJS.ReadableStream,
        fs.createWriteStream(destinationPath),
      );
    } catch (error) {
      console.error(`Error downloading file ${fileKey} from R2:`, error);
      throw new InternalServerErrorException(
        'Error downloading video from R2.',
      );
    }
  }

  async uploadProcessedVideo(
    filePath: string,
    originalName: string,
    mimeType: string,
  ): Promise<string> {
    try {
      // Create a readable stream to prevent RAM saturation
      const fileStream = fs.createReadStream(filePath);

      const fileExtension = originalName.split('.').pop() || 'mp4';
      const fileKey = `output-videos/${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: fileStream,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);

      return fileKey;
    } catch (error) {
      console.error('Error uploading processed result to R2:', error);
      throw new InternalServerErrorException(
        'Error uploading processed video.',
      );
    }
  }
}
