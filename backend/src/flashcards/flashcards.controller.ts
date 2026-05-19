import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

class ReviewCardDto {
  userId: string;
  flashcardId: string;
  ease: number; // 1 | 2 | 3 | 4
}

@ApiTags('Spaced Repetition Flashcards')
@Controller('flashcards')
export class FlashcardsController {
  constructor(private flashcardsService: FlashcardsService) {}

  @Get('due')
  @ApiOperation({ summary: 'Retrieve due flashcards for study' })
  async getDueFlashcards(
    @Query('userId') userId: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.flashcardsService.getDueFlashcards(userId, courseId);
  }

  @Post('review')
  @ApiOperation({ summary: 'Submit review scores to update spaced repetition times' })
  async recordReviewScore(@Body() dto: ReviewCardDto) {
    return this.flashcardsService.recordReviewScore(dto.userId, dto.flashcardId, dto.ease);
  }
}
