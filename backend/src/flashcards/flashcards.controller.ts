import { Controller, Get, Post, Body, Query, Put, Delete, Param } from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional } from 'class-validator';

class ReviewCardDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  flashcardId: string;

  @IsNumber()
  @Min(1)
  @Max(4)
  ease: number; // 1 | 2 | 3 | 4
}

class CreateFlashcardDto {
  @IsString()
  @IsNotEmpty()
  nodeId: string;

  @IsString()
  @IsNotEmpty()
  tag: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}

class UpdateFlashcardDto {
  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsOptional()
  question?: string;

  @IsString()
  @IsOptional()
  answer?: string;
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

  @Post()
  @ApiOperation({ summary: 'Create a new flashcard (Admin)' })
  async createFlashcard(@Body() dto: CreateFlashcardDto) {
    return this.flashcardsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all flashcards (Admin)' })
  async getFlashcards(@Query('nodeId') nodeId?: string) {
    return this.flashcardsService.findAll(nodeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a single flashcard (Admin)' })
  async getFlashcardById(@Param('id') id: string) {
    return this.flashcardsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a flashcard (Admin)' })
  async updateFlashcard(@Param('id') id: string, @Body() dto: UpdateFlashcardDto) {
    return this.flashcardsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a flashcard (Admin)' })
  async deleteFlashcard(@Param('id') id: string) {
    return this.flashcardsService.remove(id);
  }

  @Post('nodes/:nodeId/bulk')
  @ApiOperation({ summary: 'Bulk import flashcards for a concept node (Admin)' })
  async bulkImport(
    @Param('nodeId') nodeId: string,
    @Body() dto: { flashcards: { question: string; answer: string; tag?: string }[] },
  ) {
    return this.flashcardsService.bulkImport(nodeId, dto.flashcards);
  }
}
