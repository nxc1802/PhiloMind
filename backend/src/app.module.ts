import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AIModule } from './ai/ai.module';
import { SupabaseModule } from './supabase/supabase.module';
import { TTSModule } from './tts/tts.module';
import { CoursesModule } from './courses/courses.module';
import { DebatesModule } from './debate/debates.module';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { UsersModule } from './users/users.module';
import { PhilosofunModule } from './philosofun/philosofun.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AIModule,
    SupabaseModule,
    TTSModule,
    CoursesModule,
    DebatesModule,
    FlashcardsModule,
    QuizzesModule,
    UsersModule,
    PhilosofunModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
