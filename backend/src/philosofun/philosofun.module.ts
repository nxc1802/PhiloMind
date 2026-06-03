import { Module } from '@nestjs/common';
import { PhilosofunController } from './philosofun.controller';
import { PhilosofunService } from './philosofun.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PhilosofunController],
  providers: [PhilosofunService],
  exports: [PhilosofunService],
})
export class PhilosofunModule {}
