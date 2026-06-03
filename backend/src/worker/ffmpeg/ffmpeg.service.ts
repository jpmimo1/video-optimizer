import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import Ffmpeg from 'fluent-ffmpeg';

export interface CompressSettings {
  quality?: 'high' | 'balanced' | 'low';
}

export interface ConvertSettings {
  format?: 'mp4' | 'webm' | 'mov';
}

export interface TrimSettings {
  startTime?: string;
  endTime?: string;
}

export interface ThumbnailSettings {
  second?: number;
}

@Injectable()
export class FfmpegService {
  async compressVideo(
    inputPath: string,
    outputPath: string,
    settings: Prisma.InputJsonValue,
    onProgress?: (percent: number) => void,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const opts = (settings as CompressSettings) || {};
      const quality = opts.quality || 'balanced';

      // Map the quality setting to an FFmpeg CRF (Constant Rate Factor) value
      let crf = '28'; // balanced
      if (quality === 'high') crf = '23';
      if (quality === 'low') crf = '32';

      console.log(
        `🎬 [FFmpeg] Compressing (Quality: ${quality}, CRF: ${crf})...`,
      );

      Ffmpeg(inputPath)
        .videoCodec('libx264')
        .addOption('-crf', crf)
        .addOption('-preset', 'fast')
        .on('progress', (progress) => {
          if (progress.percent && onProgress) {
            const percent = Math.min(Math.round(progress.percent), 100);
            onProgress(percent);
          }
        })
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(err.message)))
        .save(outputPath);
    });
  }

  async convertVideo(
    inputPath: string,
    outputPath: string,
    onProgress?: (percent: number) => void,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Note: The format is inherently determined by the outputPath extension,
      // which is configured upstream in the VideoProcessor.
      console.log(`🔄 [FFmpeg] Converting video...`);

      Ffmpeg(inputPath)
        .on('progress', (progress) => {
          if (progress.percent && onProgress) {
            const percent = Math.min(Math.round(progress.percent), 100);
            onProgress(percent);
          }
        })
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(err.message)))
        .save(outputPath);
    });
  }

  async trimVideo(
    inputPath: string,
    outputPath: string,
    settings: Prisma.InputJsonValue,
    onProgress?: (percent: number) => void,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const opts = (settings as TrimSettings) || {};
      const startTime = opts.startTime || '00:00:00';
      const endTime = opts.endTime;

      console.log(`✂️ [FFmpeg] Trimming from ${startTime} to ${endTime}...`);

      const command = Ffmpeg(inputPath).setStartTime(startTime);

      if (endTime) {
        // '-to' tells FFmpeg the exact timestamp to stop reading the input
        command.outputOptions([`-to ${endTime}`]);
      }

      command
        .on('progress', (progress) => {
          if (progress.percent && onProgress) {
            const percent = Math.min(Math.round(progress.percent), 100);
            onProgress(percent);
          }
        })
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(err.message)))
        .save(outputPath);
    });
  }

  async extractThumbnail(
    inputPath: string,
    outputPath: string,
    settings: Prisma.InputJsonValue,
    onProgress?: (percent: number) => void,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const opts = (settings as ThumbnailSettings) || {};
      const second = opts.second || 0;

      console.log(`🖼️ [FFmpeg] Extracting thumbnail at second ${second}...`);

      Ffmpeg(inputPath)
        .seekInput(second)
        .frames(1)
        .on('progress', (progress) => {
          if (progress.percent && onProgress) {
            const percent = Math.min(Math.round(progress.percent), 100);
            onProgress(percent);
          }
        })
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(err.message)))
        .save(outputPath);
    });
  }
}
