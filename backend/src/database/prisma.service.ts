import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database.');
    } catch (error) {
      this.logger.warn(`Database connection failed on startup: ${error.message}. Prisma will attempt to reconnect lazily on the first query.`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
