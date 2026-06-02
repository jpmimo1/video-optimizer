import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { R2Module } from 'src/r2/r2.module';

@Module({
  imports: [R2Module],
  providers: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
