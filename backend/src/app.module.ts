import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AIModule } from './ai/ai.module';
import { SupabaseModule } from './supabase/supabase.module';
import { TTSModule } from './tts/tts.module';
import { CoursesModule } from './courses/courses.module';
import { DebatesModule } from './debate/debates.module';
import { FlashcardsModule } from './flashcards/flashcards.module';

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
  ],
})
export class AppModule {}
