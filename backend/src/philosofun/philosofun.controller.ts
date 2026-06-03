import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PhilosofunService } from './philosofun.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

class CreatePhilosofunDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  videoUrl: string;
}

class UpdatePhilosofunDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;
}

@ApiTags('Philosofun')
@Controller('philosofun')
export class PhilosofunController {
  constructor(private readonly service: PhilosofunService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a new Philosofun video' })
  async create(@Body() dto: CreatePhilosofunDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all Philosofun videos' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single video details' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a video' })
  async update(@Param('id') id: string, @Body() dto: UpdatePhilosofunDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a video' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
