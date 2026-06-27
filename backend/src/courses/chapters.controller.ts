import { Controller, Get, Post, Body, Param, Query, Put, Delete, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';

@ApiTags('Courses & Roadmaps')
@Controller('chapters')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChaptersController {
  constructor(private coursesService: CoursesService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new chapter (Admin)' })
  async createChapter(@Body() dto: CreateChapterDto) {
    return this.coursesService.createChapter(dto.title, dto.orderIndex, dto.courseId, dto.parentChapterId);
  }

  @Get()
  @ApiOperation({ summary: 'List all chapters' })
  async getChapters(@Query('courseId') courseId?: string) {
    return this.coursesService.getChapters(courseId);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get single chapter details (Admin)' })
  async getChapterById(@Param('id') id: string) {
    return this.coursesService.getChapterById(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a chapter (Admin)' })
  async updateChapter(@Param('id') id: string, @Body() dto: UpdateChapterDto) {
    return this.coursesService.updateChapter(id, dto.title, dto.orderIndex, dto.parentChapterId);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a chapter (Admin)' })
  async deleteChapter(@Param('id') id: string) {
    return this.coursesService.deleteChapter(id);
  }
}
