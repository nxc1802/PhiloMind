import { Controller, Get, Post, Body, Query, Put, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class ReviewCardDto {
  @IsString()
  @IsOptional()
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
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FlashcardsController {
  constructor(private flashcardsService: FlashcardsService) {}

  @Get('due')
  @ApiOperation({ summary: 'Retrieve due flashcards for study' })
  async getDueFlashcards(
    @Query('courseId') courseId?: string,
    @Req() req?: any,
  ) {
    return this.flashcardsService.getDueFlashcards(req.user.id, courseId);
  }

  @Post('review')
  @ApiOperation({ summary: 'Submit review scores to update spaced repetition times' })
  async recordReviewScore(@Body() dto: ReviewCardDto, @Req() req: any) {
    return this.flashcardsService.recordReviewScore(req.user.id, dto.flashcardId, dto.ease);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new flashcard (Admin)' })
  async createFlashcard(@Body() dto: CreateFlashcardDto) {
    return this.flashcardsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all flashcards' })
  async getFlashcards(@Query('nodeId') nodeId?: string) {
    return this.flashcardsService.findAll(nodeId);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get details of a single flashcard (Admin)' })
  async getFlashcardById(@Param('id') id: string) {
    return this.flashcardsService.findById(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a flashcard (Admin)' })
  async updateFlashcard(@Param('id') id: string, @Body() dto: UpdateFlashcardDto) {
    return this.flashcardsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a flashcard (Admin)' })
  async deleteFlashcard(@Param('id') id: string) {
    return this.flashcardsService.remove(id);
  }

  @Post('nodes/:nodeId/bulk')
  @Roles('admin')
  @ApiOperation({ summary: 'Bulk import flashcards for a concept node (Admin)' })
  async bulkImport(
    @Param('nodeId') nodeId: string,
    @Body() dto: { flashcards: { question: string; answer: string; tag?: string }[] },
  ) {
    return this.flashcardsService.bulkImport(nodeId, dto.flashcards);
  }
}
