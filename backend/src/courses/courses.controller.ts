import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Req,
} from "@nestjs/common";
import { CoursesService } from "./courses.service";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { UploadDocDto } from "./dto/upload-doc.dto";

@ApiTags("Courses & Roadmaps")
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  // ==================== COURSES ====================

  @Post("courses")
  @Roles("admin")
  @ApiOperation({ summary: "Create a new course workspace" })
  async createCourse(@Body() dto: CreateCourseDto, @Req() req: any) {
    return this.coursesService.createCourse(
      dto.userId || req.user.id,
      dto.title,
      dto.description,
    );
  }

  @Get("courses")
  @ApiOperation({ summary: "Retrieve courses list" })
  async getCourses(@Req() req: any, @Query("userId") userId?: string) {
    const resolvedUserId =
      req.user.role === "admin" ? userId || req.user.id : req.user.id;
    return this.coursesService.getCourses(resolvedUserId);
  }

  @Get("courses/:id")
  @Roles("admin")
  @ApiOperation({ summary: "Retrieve single course details (Admin)" })
  async getCourseById(@Param("id") id: string) {
    return this.coursesService.getCourseById(id);
  }

  @Put("courses/:id")
  @Roles("admin")
  @ApiOperation({ summary: "Update course details (Admin)" })
  async updateCourse(@Param("id") id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.updateCourse(id, dto.title, dto.description);
  }

  @Delete("courses/:id")
  @Roles("admin")
  @ApiOperation({ summary: "Delete a course (Admin)" })
  async deleteCourse(@Param("id") id: string) {
    return this.coursesService.deleteCourse(id);
  }

  @Post("courses/:id/upload")
  @Roles("admin")
  @ApiOperation({
    summary:
      "Upload textbook parsed content to generate roadmap mindmap structure",
  })
  async uploadDocument(
    @Param("id") courseId: string,
    @Body() dto: UploadDocDto,
  ) {
    return this.coursesService.processDocumentUpload(
      courseId,
      dto.fileName,
      dto.content,
    );
  }

  // ==================== BUCKET FILE UPLOADER ====================

  @Post("files/upload")
  @Roles("admin")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload an arbitrary file to the storage bucket" })
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    return this.coursesService.saveUploadedFile(
      file.originalname,
      file.buffer,
      file.mimetype,
    );
  }
}
