import { Controller, Get, Post, Body, Param, Query, Patch, Put, Delete, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

class UpdateCourseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

class UploadDocDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

class UpdateProgressDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsOptional()
  lessonCompleted?: boolean;

  @IsOptional()
  flashcardCompleted?: boolean;

  @IsOptional()
  podcastCompleted?: boolean;

  @IsOptional()
  quizCompleted?: boolean;
}

class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  orderIndex: number;

  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsOptional()
  parentChapterId?: string;
}

class UpdateChapterDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @IsString()
  @IsOptional()
  parentChapterId?: string;
}

class CreateNodeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsString()
  @IsNotEmpty()
  originalText: string;

  @IsString()
  @IsNotEmpty()
  quickTake: string;

  @IsString()
  @IsOptional()
  difficulty?: string;

  @IsString()
  @IsOptional()
  timeToRead?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string; // YouTube Video URL

  @IsNumber()
  @IsNotEmpty()
  orderIndex: number;

  @IsString()
  @IsNotEmpty()
  chapterId: string;

  @IsString()
  @IsNotEmpty()
  lessonType: string;

  @IsOptional()
  storyIntro?: any;

  @IsOptional()
  lessonContents?: any;

  @IsOptional()
  minigame?: any;

  @IsOptional()
  finalSummary?: any;
}

class UpdateNodeDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  originalText?: string;

  @IsString()
  @IsOptional()
  quickTake?: string;

  @IsString()
  @IsOptional()
  difficulty?: string;

  @IsString()
  @IsOptional()
  timeToRead?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string; // YouTube Video URL

  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @IsString()
  @IsOptional()
  lessonType?: string;

  @IsOptional()
  storyIntro?: any;

  @IsOptional()
  lessonContents?: any;

  @IsOptional()
  minigame?: any;

  @IsOptional()
  finalSummary?: any;
}

class SynthesizePodcastDto {
  @IsString()
  @IsNotEmpty()
  nodeId: string;

  @IsString()
  @IsNotEmpty()
  scriptText: string;
}

class CreateWarmupDto {
  @IsString()
  @IsNotEmpty()
  type: string; // "image-guess" | "story"

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  blanks?: string;

  @IsString()
  @IsOptional()
  answer?: string;

  @IsString()
  @IsOptional()
  story?: string;

  @IsString()
  @IsOptional()
  question?: string;

  @IsOptional()
  options?: string[];

  @IsOptional()
  correctIndex?: number;

  @IsString()
  @IsNotEmpty()
  reveal: string;
}

class CreatePodcastDto {
  @IsString()
  @IsNotEmpty()
  nodeId: string;

  @IsString()
  @IsNotEmpty()
  audioUrl: string;

  @IsNotEmpty()
  transcript: any;
}

class UpdatePodcastDto {
  @IsString()
  @IsOptional()
  audioUrl?: string;

  @IsOptional()
  transcript?: any;
}

@ApiTags('Courses & Roadmaps')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  // ==================== COURSES ====================

  @Post('courses')
  @ApiOperation({ summary: 'Create a new course workspace' })
  async createCourse(@Body() dto: CreateCourseDto) {
    return this.coursesService.createCourse(dto.userId, dto.title, dto.description);
  }

  @Get('courses')
  @ApiOperation({ summary: 'Retrieve courses list' })
  async getCourses(@Query('userId') userId?: string) {
    return this.coursesService.getCourses(userId);
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Retrieve single course details (Admin)' })
  async getCourseById(@Param('id') id: string) {
    return this.coursesService.getCourseById(id);
  }

  @Put('courses/:id')
  @ApiOperation({ summary: 'Update course details (Admin)' })
  async updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.updateCourse(id, dto.title, dto.description);
  }

  @Delete('courses/:id')
  @ApiOperation({ summary: 'Delete a course (Admin)' })
  async deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }

  @Post('courses/:id/upload')
  @ApiOperation({ summary: 'Upload textbook parsed content to generate roadmap mindmap structure' })
  async uploadDocument(@Param('id') courseId: string, @Body() dto: UploadDocDto) {
    return this.coursesService.processDocumentUpload(courseId, dto.fileName, dto.content);
  }

  // ==================== CHAPTERS ====================

  @Post('chapters')
  @ApiOperation({ summary: 'Create a new chapter (Admin)' })
  async createChapter(@Body() dto: CreateChapterDto) {
    return this.coursesService.createChapter(dto.title, dto.orderIndex, dto.courseId, dto.parentChapterId);
  }

  @Get('chapters')
  @ApiOperation({ summary: 'List all chapters (Admin)' })
  async getChapters(@Query('courseId') courseId?: string) {
    return this.coursesService.getChapters(courseId);
  }

  @Get('chapters/:id')
  @ApiOperation({ summary: 'Get single chapter details (Admin)' })
  async getChapterById(@Param('id') id: string) {
    return this.coursesService.getChapterById(id);
  }

  @Put('chapters/:id')
  @ApiOperation({ summary: 'Update a chapter (Admin)' })
  async updateChapter(@Param('id') id: string, @Body() dto: UpdateChapterDto) {
    return this.coursesService.updateChapter(id, dto.title, dto.orderIndex, dto.parentChapterId);
  }

  @Delete('chapters/:id')
  @ApiOperation({ summary: 'Delete a chapter (Admin)' })
  async deleteChapter(@Param('id') id: string) {
    return this.coursesService.deleteChapter(id);
  }

  // ==================== CONCEPT NODES ====================

  @Get('courses/:id/journey')
  @ApiOperation({ summary: 'Get course journey roadmap nodes' })
  async getCourseJourney(@Param('id') courseId: string, @Query('userId') userId: string) {
    return this.coursesService.getCourseJourney(courseId, userId);
  }

  @Get('courses/nodes/:nodeId')
  @ApiOperation({ summary: 'Retrieve comprehensive learn detail for a concept node' })
  async getNodeDetails(@Param('nodeId') nodeId: string, @Query('userId') userId: string) {
    return this.coursesService.getNodeDetails(nodeId, userId);
  }

  @Get('courses/nodes/:nodeId/core')
  @ApiOperation({ summary: 'Retrieve core progress and type info for a concept node' })
  async getNodeCore(@Param('nodeId') nodeId: string, @Query('userId') userId: string) {
    return this.coursesService.getNodeCore(nodeId, userId);
  }

  @Post('courses/nodes/:nodeId/complete')
  @ApiOperation({ summary: 'Mark node as completed and auto-unlock next node' })
  async completeNode(
    @Param('nodeId') nodeId: string,
    @Body() dto: { userId: string },
  ) {
    return this.coursesService.completeNode(nodeId, dto.userId);
  }

  @Patch('courses/nodes/:nodeId/progress')
  @ApiOperation({ summary: 'Update node learn progress status' })
  async updateNodeProgress(
    @Param('nodeId') nodeId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.coursesService.updateNodeProgress(
      dto.userId,
      nodeId,
      dto.status,
      dto.lessonCompleted,
      dto.flashcardCompleted,
      dto.podcastCompleted,
      dto.quizCompleted,
    );
  }

  @Post('nodes')
  @ApiOperation({ summary: 'Create a new concept node (Admin)' })
  async createNode(@Body() dto: CreateNodeDto) {
    return this.coursesService.createNode(dto);
  }

  @Get('nodes')
  @ApiOperation({ summary: 'List all concept nodes (Admin)' })
  async getNodes(@Query('chapterId') chapterId?: string) {
    return this.coursesService.getNodes(chapterId);
  }

  @Put('nodes/:nodeId')
  @ApiOperation({ summary: 'Update a concept node (Admin)' })
  async updateNode(@Param('nodeId') nodeId: string, @Body() dto: UpdateNodeDto) {
    return this.coursesService.updateNode(nodeId, dto);
  }

  @Delete('nodes/:nodeId')
  @ApiOperation({ summary: 'Delete a concept node (Admin)' })
  async deleteNode(@Param('nodeId') nodeId: string) {
    return this.coursesService.deleteNode(nodeId);
  }

  // ==================== PODCASTS ====================

  @Get('podcasts')
  @ApiOperation({ summary: 'List all podcasts (Admin)' })
  async getPodcasts() {
    return this.coursesService.getPodcasts();
  }

  @Get('podcasts/:id')
  @ApiOperation({ summary: 'Get single podcast details (Admin)' })
  async getPodcastById(@Param('id') id: string) {
    return this.coursesService.getPodcastById(id);
  }

  @Post('podcasts')
  @ApiOperation({ summary: 'Create a new podcast manually (Admin)' })
  async createPodcast(@Body() dto: CreatePodcastDto) {
    return this.coursesService.createPodcast(dto);
  }

  @Put('podcasts/:id')
  @ApiOperation({ summary: 'Update a podcast (Admin)' })
  async updatePodcast(@Param('id') id: string, @Body() dto: UpdatePodcastDto) {
    return this.coursesService.updatePodcast(id, dto);
  }

  @Delete('podcasts/:id')
  @ApiOperation({ summary: 'Delete a podcast (Admin)' })
  async deletePodcast(@Param('id') id: string) {
    return this.coursesService.deletePodcast(id);
  }

  @Post('podcasts/synthesize')
  @ApiOperation({ summary: 'Synthesize script text via TTS and return public audio URL for preview' })
  async synthesizePodcast(@Body() dto: SynthesizePodcastDto) {
    return this.coursesService.synthesizePodcast(dto.nodeId, dto.scriptText);
  }

  // ==================== WARMUPS ====================

  @Post('nodes/:nodeId/warmups')
  @ApiOperation({ summary: 'Create a new warmup for a concept node (Admin)' })
  async createWarmup(@Param('nodeId') nodeId: string, @Body() dto: CreateWarmupDto) {
    return this.coursesService.createWarmup(nodeId, dto);
  }

  @Get('nodes/:nodeId/warmups')
  @ApiOperation({ summary: 'List all warmups for a concept node' })
  async getWarmups(@Param('nodeId') nodeId: string) {
    return this.coursesService.getWarmups(nodeId);
  }

  @Delete('warmups/:id')
  @ApiOperation({ summary: 'Delete a warmup by ID (Admin)' })
  async deleteWarmup(@Param('id') id: string) {
    return this.coursesService.deleteWarmup(id);
  }

  // ==================== DISCUSSIONS / COMMENTS ====================

  @Post('courses/nodes/:nodeId/comments')
  @ApiOperation({ summary: 'Post a comment on a concept node discussion' })
  async createComment(
    @Param('nodeId') nodeId: string,
    @Body() dto: { userId: string; content: string; role?: string },
  ) {
    return this.coursesService.createComment(nodeId, dto.userId, dto.content, dto.role);
  }

  @Get('courses/nodes/:nodeId/comments')
  @ApiOperation({ summary: 'Get all comments for a concept node discussion' })
  async getComments(@Param('nodeId') nodeId: string) {
    return this.coursesService.getComments(nodeId);
  }

  // ==================== BUCKET FILE UPLOADER ====================

  @Post('files/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload an arbitrary file to the storage bucket' })
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.coursesService.saveUploadedFile(file.originalname, file.buffer, file.mimetype);
  }

  // ==================== PDF REFERENCE DOCUMENTS CRUD ====================

  @Post('documents')
  @ApiOperation({ summary: 'Save a PDF document reference' })
  async createDocument(
    @Body() dto: { courseId: string; fileName: string; fileUrl: string; status?: string; title?: string; description?: string },
  ) {
    return this.coursesService.createDocument(dto.courseId, dto.fileName, dto.fileUrl, dto.status, dto.title, dto.description);
  }

  @Get('documents')
  @ApiOperation({ summary: 'List all reference PDF documents' })
  async listDocuments(@Query('courseId') courseId?: string) {
    return this.coursesService.listDocuments(courseId);
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: 'Delete a PDF reference document by ID' })
  async deleteDocument(@Param('id') id: string) {
    return this.coursesService.deleteDocument(id);
  }
}
