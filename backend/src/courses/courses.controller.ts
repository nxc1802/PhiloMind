import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

class CreateCourseDto {
  title: string;
  description?: string;
  userId: string;
}

class UploadDocDto {
  fileName: string;
  content: string;
}

class UpdateProgressDto {
  userId: string;
  status: string; // "locked" | "available" | "in_progress" | "completed"
}

@ApiTags('Courses & Roadmaps')
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course workspace' })
  async createCourse(@Body() dto: CreateCourseDto) {
    return this.coursesService.createCourse(dto.userId, dto.title, dto.description);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve courses list for a specific user' })
  async getCourses(@Query('userId') userId: string) {
    return this.coursesService.getCourses(userId);
  }

  @Post(':id/upload')
  @ApiOperation({ summary: 'Upload textbook parsed content to generate roadmap mindmap structure' })
  async uploadDocument(@Param('id') courseId: string, @Body() dto: UploadDocDto) {
    return this.coursesService.processDocumentUpload(courseId, dto.fileName, dto.content);
  }

  @Get(':id/journey')
  @ApiOperation({ summary: 'Get course journey roadmap nodes' })
  async getCourseJourney(@Param('id') courseId: string, @Query('userId') userId: string) {
    return this.coursesService.getCourseJourney(courseId, userId);
  }

  @Get('nodes/:nodeId')
  @ApiOperation({ summary: 'Retrieve comprehensive learn detail for a concept node' })
  async getNodeDetails(@Param('nodeId') nodeId: string, @Query('userId') userId: string) {
    return this.coursesService.getNodeDetails(nodeId, userId);
  }

  @Patch('nodes/:nodeId/progress')
  @ApiOperation({ summary: 'Update node learn progress status' })
  async updateNodeProgress(
    @Param('nodeId') nodeId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.coursesService.updateNodeProgress(dto.userId, nodeId, dto.status);
  }
}
