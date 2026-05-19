import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AIService } from '../ai/ai.service';

@Injectable()
export class DebatesService {
  constructor(
    private prisma: PrismaService,
    private ai: AIService,
  ) {}

  async getOrCreateDebate(nodeId: string, userId: string) {
    let debate = await this.prisma.debate.findFirst({
      where: { nodeId, userId },
    });

    if (!debate) {
      const node = await this.prisma.conceptNode.findUnique({
        where: { id: nodeId },
      });
      if (!node) throw new NotFoundException('Concept node not found');

      // Initialize default prompt
      const prompt = `Let's debate the concept of "${node.title}". Consider this proposition: ${node.quickTake}. Do you agree with this statement, or do you find inconsistencies in its core logic? Why?`;
      
      debate = await this.prisma.debate.create({
        data: {
          nodeId,
          userId,
          transcript: [
            { speaker: 'Host', text: prompt, time: 0 },
          ] as any,
        },
      });
    }

    return debate;
  }

  async sendDebateMessage(nodeId: string, userId: string, message: string) {
    const debate = await this.getOrCreateDebate(nodeId, userId);
    const transcript = debate.transcript as any[];

    // Format chat history for OpenRouter LLM
    const chatHistory = transcript.map((t) => ({
      role: t.speaker === 'Host' ? 'assistant' : ('user' as 'user' | 'assistant'),
      content: t.text,
    }));

    // Generate Socratic response from AI
    const reply = await this.ai.getSocraticDebateReply(debate.nodeId, message, chatHistory);

    // Append to transcript
    const updatedTranscript = [
      ...transcript,
      { speaker: 'User', text: message, time: Date.now() },
      { speaker: 'Host', text: reply, time: Date.now() },
    ];

    // Save back to db
    return this.prisma.debate.update({
      where: { id: debate.id },
      data: { transcript: updatedTranscript as any },
    });
  }
}
