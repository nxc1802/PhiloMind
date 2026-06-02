import { Controller, Get, Post, Body, Param, Query, Put, Delete } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

class CreateQuizDto {
  @IsString()
  @IsOptional()
  nodeId?: string;

  @IsString()
  @IsNotEmpty()
  type: string; // "mcq" | "matching" | "essay" | "image" | "analysis"

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  questions: any;
}

class UpdateQuizDto {
  @IsString()
  @IsOptional()
  nodeId?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  questions?: any;
}

@ApiTags('Quizzes & Interactive Systems')
@Controller('quizzes')
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quiz or matching game' })
  async createQuiz(@Body() dto: CreateQuizDto) {
    return this.quizzesService.createQuiz(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all quizzes, optionally filtered by ConceptNode ID' })
  async getQuizzes(@Query('nodeId') nodeId?: string) {
    return this.quizzesService.getQuizzes(nodeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single quiz details' })
  async getQuizById(@Param('id') id: string) {
    return this.quizzesService.getQuizById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a quiz' })
  async updateQuiz(@Param('id') id: string, @Body() dto: UpdateQuizDto) {
    return this.quizzesService.updateQuiz(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quiz by ID' })
  async deleteQuiz(@Param('id') id: string) {
    return this.quizzesService.deleteQuiz(id);
  }
}
