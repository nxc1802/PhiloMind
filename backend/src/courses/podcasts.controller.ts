import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { CoursesService } from "./courses.service";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CreatePodcastDto } from "./dto/create-podcast.dto";
import { UpdatePodcastDto } from "./dto/update-podcast.dto";
import { SynthesizePodcastDto } from "./dto/synthesize-podcast.dto";
import { Throttle } from "@nestjs/throttler";

@ApiTags("Courses & Roadmaps")
@Controller("podcasts")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PodcastsController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  @Roles("admin")
  @ApiOperation({ summary: "List all podcasts (Admin)" })
  async getPodcasts() {
    return this.coursesService.getPodcasts();
  }

  @Get(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Get single podcast details (Admin)" })
  async getPodcastById(@Param("id") id: string) {
    return this.coursesService.getPodcastById(id);
  }

  @Post()
  @Roles("admin")
  @ApiOperation({ summary: "Create a new podcast manually (Admin)" })
  async createPodcast(@Body() dto: CreatePodcastDto) {
    return this.coursesService.createPodcast(dto);
  }

  @Put(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Update a podcast (Admin)" })
  async updatePodcast(@Param("id") id: string, @Body() dto: UpdatePodcastDto) {
    return this.coursesService.updatePodcast(id, dto);
  }

  @Delete(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Delete a podcast (Admin)" })
  async deletePodcast(@Param("id") id: string) {
    return this.coursesService.deletePodcast(id);
  }

  @Post("synthesize")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Roles("admin")
  @ApiOperation({
    summary:
      "Synthesize script text via TTS and return public audio URL for preview",
  })
  async synthesizePodcast(@Body() dto: SynthesizePodcastDto) {
    return this.coursesService.synthesizePodcast(dto.nodeId, dto.scriptText);
  }
}
