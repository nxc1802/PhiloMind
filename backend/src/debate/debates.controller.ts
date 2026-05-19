import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { DebatesService } from './debates.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

class DebateMessageDto {
  userId: string;
  message: string;
}

@ApiTags('Socratic AI Debate')
@Controller('debates')
export class DebatesController {
  constructor(private debatesService: DebatesService) {}

  @Get(':nodeId')
  @ApiOperation({ summary: 'Get or initialize a Socratic debate session transcript' })
  async getDebateTranscript(@Param('nodeId') nodeId: string, @Query('userId') userId: string) {
    return this.debatesService.getOrCreateDebate(nodeId, userId);
  }

  @Post(':nodeId/message')
  @ApiOperation({ summary: 'Post a user argument and get a Socratic rebuttal' })
  async sendDebateMessage(
    @Param('nodeId') nodeId: string,
    @Body() dto: DebateMessageDto,
  ) {
    return this.debatesService.sendDebateMessage(nodeId, dto.userId, dto.message);
  }
}
