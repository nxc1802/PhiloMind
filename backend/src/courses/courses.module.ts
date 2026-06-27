import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { ChaptersController } from './chapters.controller';
import { NodesController } from './nodes.controller';
import { PodcastsController } from './podcasts.controller';

@Module({
  controllers: [CoursesController, ChaptersController, NodesController, PodcastsController],
  providers: [CoursesService],
})
export class CoursesModule {}
