import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Put,
  UseGuards,
  Req,
} from "@nestjs/common";
import { DebatesService } from "./debates.service";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { DebateMessageDto } from "./dto/debate-message.dto";
import { CreateDebateTopicDto } from "./dto/create-debate-topic.dto";
import { Throttle } from "@nestjs/throttler";

@ApiTags("Socratic AI Debate")
@Controller("debates")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DebatesController {
  constructor(private debatesService: DebatesService) {}

  // ==================== DEBATE TOPICS / SCENARIOS (Admin & User) ====================

  @Get("topics")
  @ApiOperation({ summary: "List all Socratic debate topics/scenarios" })
  async getTopics() {
    return this.debatesService.getTopics();
  }

  @Post("topics")
  @Roles("admin")
  @ApiOperation({ summary: "Create a new debate topic (Admin)" })
  async createTopic(@Body() dto: CreateDebateTopicDto) {
    return this.debatesService.createTopic(dto);
  }

  @Put("topics/:id")
  @Roles("admin")
  @ApiOperation({ summary: "Update a debate topic (Admin)" })
  async updateTopic(
    @Param("id") id: string,
    @Body() dto: CreateDebateTopicDto,
  ) {
    return this.debatesService.updateTopic(id, dto);
  }

  @Delete("topics/:id")
  @Roles("admin")
  @ApiOperation({ summary: "Delete a debate topic (Admin)" })
  async deleteTopic(@Param("id") id: string) {
    return this.debatesService.deleteTopic(id);
  }

  // ==================== TOPIC DEBATE WORKFLOW ====================

  @Get("topic/:topicId")
  @ApiOperation({ summary: "Get or initialize a debate topic session" })
  async getTopicDebate(@Param("topicId") topicId: string, @Req() req: any) {
    return this.debatesService.getOrCreateTopicDebate(topicId, req.user.id);
  }

  @Post("topic/:topicId/message")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: "Post a user argument to a topic debate session and get rebuttal",
  })
  async sendTopicDebateMessage(
    @Param("topicId") topicId: string,
    @Body() dto: DebateMessageDto,
    @Req() req: any,
  ) {
    return this.debatesService.sendTopicDebateMessage(
      topicId,
      req.user.id,
      dto.message,
    );
  }

  // ==================== CONCEPT NODE DEBATE WORKFLOW ====================

  @Get("all")
  @Roles("admin")
  @ApiOperation({ summary: "List all Socratic debate sessions (Admin)" })
  async getAllDebates() {
    return this.debatesService.findAll();
  }

  @Get(":nodeId")
  @ApiOperation({
    summary: "Get or initialize a Socratic debate session transcript",
  })
  async getDebateTranscript(@Param("nodeId") nodeId: string, @Req() req: any) {
    return this.debatesService.getOrCreateDebate(nodeId, req.user.id);
  }

  @Post(":nodeId/message")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: "Post a user argument and get a Socratic rebuttal" })
  async sendDebateMessage(
    @Param("nodeId") nodeId: string,
    @Body() dto: DebateMessageDto,
    @Req() req: any,
  ) {
    return this.debatesService.sendDebateMessage(
      nodeId,
      req.user.id,
      dto.message,
    );
  }

  @Delete(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Delete a Socratic debate session (Admin)" })
  async deleteDebate(@Param("id") id: string) {
    return this.debatesService.remove(id);
  }
}
