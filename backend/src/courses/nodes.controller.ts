import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Put,
  Delete,
  UseGuards,
  Req,
} from "@nestjs/common";
import { CoursesService } from "./courses.service";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CreateNodeDto } from "./dto/create-node.dto";
import { UpdateNodeDto } from "./dto/update-node.dto";
import { UpdateProgressDto } from "./dto/update-progress.dto";
import { UpdateComponentProgressDto } from "./dto/update-component-progress.dto";
import { CreateWarmupDto } from "./dto/create-warmup.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CreateDocumentRefDto } from "./dto/create-document-ref.dto";

@ApiTags("Courses & Roadmaps")
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NodesController {
  constructor(private coursesService: CoursesService) {}

  // ==================== CONCEPT NODES ====================

  @Get("courses/:id/journey")
  @ApiOperation({ summary: "Get course journey roadmap nodes" })
  async getCourseJourney(@Param("id") courseId: string, @Req() req: any) {
    return this.coursesService.getCourseJourney(courseId, req.user.id);
  }

  @Get("courses/nodes/:nodeId")
  @ApiOperation({
    summary: "Retrieve comprehensive learn detail for a concept node",
  })
  async getNodeDetails(@Param("nodeId") nodeId: string, @Req() req: any) {
    return this.coursesService.getNodeDetails(nodeId, req.user.id);
  }

  @Get("courses/nodes/:nodeId/core")
  @ApiOperation({
    summary: "Retrieve core progress and type info for a concept node",
  })
  async getNodeCore(@Param("nodeId") nodeId: string, @Req() req: any) {
    return this.coursesService.getNodeCore(nodeId, req.user.id);
  }

  @Post("courses/nodes/:nodeId/complete")
  @ApiOperation({ summary: "Mark node as completed and auto-unlock next node" })
  async completeNode(@Param("nodeId") nodeId: string, @Req() req: any) {
    return this.coursesService.completeNode(nodeId, req.user.id);
  }

  @Patch("courses/nodes/:nodeId/progress")
  @ApiOperation({ summary: "Update node learn progress status" })
  async updateNodeProgress(
    @Param("nodeId") nodeId: string,
    @Body() dto: UpdateProgressDto,
    @Req() req: any,
  ) {
    return this.coursesService.updateNodeProgress(
      req.user.id,
      nodeId,
      dto.status,
      dto.lessonCompleted,
      dto.flashcardCompleted,
      dto.podcastCompleted,
      dto.quizCompleted,
    );
  }

  @Patch("courses/nodes/:nodeId/component-progress")
  @ApiOperation({ summary: "Update component-based lesson progress" })
  async updateComponentProgress(
    @Param("nodeId") nodeId: string,
    @Body() dto: UpdateComponentProgressDto,
    @Req() req: any,
  ) {
    return this.coursesService.updateComponentProgress(
      req.user.id,
      nodeId,
      dto.activeComponentId,
      dto.currentComponentIndex,
      dto.completedComponentIds,
      dto.componentResult,
    );
  }

  @Post("nodes")
  @Roles("admin")
  @ApiOperation({ summary: "Create a new concept node (Admin)" })
  async createNode(@Body() dto: CreateNodeDto) {
    return this.coursesService.createNode(dto);
  }

  @Get("nodes")
  @Roles("admin")
  @ApiOperation({ summary: "List all concept nodes (Admin)" })
  async getNodes(@Query("chapterId") chapterId?: string) {
    return this.coursesService.getNodes(chapterId);
  }

  @Put("nodes/:nodeId")
  @Roles("admin")
  @ApiOperation({ summary: "Update a concept node (Admin)" })
  async updateNode(
    @Param("nodeId") nodeId: string,
    @Body() dto: UpdateNodeDto,
  ) {
    return this.coursesService.updateNode(nodeId, dto);
  }

  @Delete("nodes/:nodeId")
  @Roles("admin")
  @ApiOperation({ summary: "Delete a concept node (Admin)" })
  async deleteNode(@Param("nodeId") nodeId: string) {
    return this.coursesService.deleteNode(nodeId);
  }

  // ==================== WARMUPS ====================

  @Post("nodes/:nodeId/warmups")
  @Roles("admin")
  @ApiOperation({ summary: "Create a new warmup for a concept node (Admin)" })
  async createWarmup(
    @Param("nodeId") nodeId: string,
    @Body() dto: CreateWarmupDto,
  ) {
    return this.coursesService.createWarmup(nodeId, dto);
  }

  @Get("nodes/:nodeId/warmups")
  @ApiOperation({ summary: "List all warmups for a concept node" })
  async getWarmups(@Param("nodeId") nodeId: string) {
    return this.coursesService.getWarmups(nodeId);
  }

  @Delete("warmups/:id")
  @Roles("admin")
  @ApiOperation({ summary: "Delete a warmup by ID (Admin)" })
  async deleteWarmup(@Param("id") id: string) {
    return this.coursesService.deleteWarmup(id);
  }

  // ==================== DISCUSSIONS / COMMENTS ====================

  @Post("courses/nodes/:nodeId/comments")
  @ApiOperation({ summary: "Post a comment on a concept node discussion" })
  async createComment(
    @Param("nodeId") nodeId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    const role = req.user.role === "admin" ? "admin" : "student";
    return this.coursesService.createComment(
      nodeId,
      req.user.id,
      dto.content,
      role,
    );
  }

  @Get("courses/nodes/:nodeId/comments")
  @ApiOperation({ summary: "Get all comments for a concept node discussion" })
  async getComments(@Param("nodeId") nodeId: string) {
    return this.coursesService.getComments(nodeId);
  }

  // ==================== PDF REFERENCE DOCUMENTS CRUD ====================

  @Post("documents")
  @Roles("admin")
  @ApiOperation({ summary: "Save a PDF document reference" })
  async createDocument(@Body() dto: CreateDocumentRefDto) {
    return this.coursesService.createDocument(
      dto.courseId,
      dto.fileName,
      dto.fileUrl,
      dto.status,
      dto.title,
      dto.description,
    );
  }

  @Get("documents")
  @ApiOperation({ summary: "List all reference PDF documents" })
  async listDocuments(@Query("courseId") courseId?: string) {
    return this.coursesService.listDocuments(courseId);
  }

  @Delete("documents/:id")
  @Roles("admin")
  @ApiOperation({ summary: "Delete a PDF reference document by ID" })
  async deleteDocument(@Param("id") id: string) {
    return this.coursesService.deleteDocument(id);
  }
}
