import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    console.log(connectionString);
    const pool = new Pool({ connectionString });

    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  // Triggered automatically on successful NestJS container startup
  async onModuleInit() {
    await this.$connect();
    console.log(
      '📊 PostgreSQL database connected successfully via Prisma Client',
    );
  }

  // Triggered automatically when Docker stops or restarts the container for graceful shutdown
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('📉 PostgreSQL database disconnected cleanly');
  }
}
