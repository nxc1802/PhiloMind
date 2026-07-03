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
import { PhilosofunService } from "./philosofun.service";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CreatePhilosofunDto } from "./dto/create-philosofun.dto";
import { UpdatePhilosofunDto } from "./dto/update-philosofun.dto";

@ApiTags("Philosofun")
@Controller("philosofun")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PhilosofunController {
  constructor(private readonly service: PhilosofunService) {}

  @Post()
  @Roles("admin")
  @ApiOperation({ summary: "Upload a new Philosofun video" })
  async create(@Body() dto: CreatePhilosofunDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List all Philosofun videos" })
  async findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get single video details" })
  async findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Put(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Update a video" })
  async update(@Param("id") id: string, @Body() dto: UpdatePhilosofunDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Delete a video" })
  async remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
