import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AIService } from '../ai/ai.service';

@Injectable()
export class DebatesService {
  constructor(
    private prisma: PrismaService,
    private ai: AIService,
  ) {}

  // ==================== DEBATE TOPICS CRUD ====================

  async getTopics() {
    return this.prisma.debateTopic.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTopic(dto: any) {
    return this.prisma.debateTopic.create({
      data: {
        title: dto.title,
        description: dto.description,
        initialPrompt: dto.initialPrompt,
      },
    });
  }

  async updateTopic(id: string, dto: any) {
    return this.prisma.debateTopic.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        initialPrompt: dto.initialPrompt,
      },
    });
  }

  async deleteTopic(id: string) {
    return this.prisma.$transaction(async (tx) => {
      // Cascade delete debates associated with this topic
      await tx.debate.deleteMany({ where: { topicId: id } });
      return tx.debateTopic.delete({ where: { id } });
    });
  }

  // ==================== TOPIC DEBATE WORKFLOW ====================

  async getOrCreateTopicDebate(topicId: string, userId: string) {
    let debate = await this.prisma.debate.findFirst({
      where: { topicId, userId },
    });

    if (!debate) {
      const topic = await this.prisma.debateTopic.findUnique({
        where: { id: topicId },
      });
      if (!topic) throw new NotFoundException('Debate topic not found');

      debate = await this.prisma.debate.create({
        data: {
          topicId,
          userId,
          transcript: [
            { speaker: 'Host', text: topic.initialPrompt, time: 0 },
          ] as any,
        },
      });
    }

    return debate;
  }

  async sendTopicDebateMessage(topicId: string, userId: string, message: string) {
    const debate = await this.getOrCreateTopicDebate(topicId, userId);
    const transcript = debate.transcript as any[];

    // Build chat history with full conversation continuous flow
    const chatHistory = transcript.map((t) => ({
      role: t.speaker === 'Host' ? 'assistant' : ('user' as 'user' | 'assistant'),
      content: t.text,
    }));

    const topic = await this.prisma.debateTopic.findUnique({ where: { id: topicId } });
    const reply = await this.ai.getSocraticDebateReply(
      topic?.title || "Tranh luận biện chứng",
      message,
      chatHistory,
    );

    const updatedTranscript = [
      ...transcript,
      { speaker: 'User', text: message, time: Date.now() },
      { speaker: 'Host', text: reply, time: Date.now() },
    ];

    return this.prisma.debate.update({
      where: { id: debate.id },
      data: { transcript: updatedTranscript as any },
    });
  }

  // ==================== CONCEPT NODE DEBATE WORKFLOW ====================

  async getOrCreateDebate(nodeId: string, userId: string) {
    let debate = await this.prisma.debate.findFirst({
      where: { nodeId, userId },
    });

    if (!debate) {
      const node = await this.prisma.conceptNode.findUnique({
        where: { id: nodeId },
      });
      if (!node) throw new NotFoundException('Concept node not found');

      // Initialize default prompt in Vietnamese
      const prompt = `Chúng ta hãy cùng thảo luận về khái niệm "${node.title}". Hãy xem xét luận điểm sau: "${node.quickTake}". Đồng chí có đồng ý với quan điểm này không, hay đồng chí nhận thấy có điểm nào chưa nhất quán trong lập luận cốt lõi này? Tại sao?`;
      
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

    // Build chat history with full conversation continuous flow
    const chatHistory = transcript.map((t) => ({
      role: t.speaker === 'Host' ? 'assistant' : ('user' as 'user' | 'assistant'),
      content: t.text,
    }));

    const node = await this.prisma.conceptNode.findUnique({ where: { id: nodeId } });
    const reply = await this.ai.getSocraticDebateReply(
      node?.title || "Tranh luận biện chứng",
      message,
      chatHistory,
    );

    const updatedTranscript = [
      ...transcript,
      { speaker: 'User', text: message, time: Date.now() },
      { speaker: 'Host', text: reply, time: Date.now() },
    ];

    return this.prisma.debate.update({
      where: { id: debate.id },
      data: { transcript: updatedTranscript as any },
    });
  }

  async findAll() {
    return this.prisma.debate.findMany({
      include: {
        node: {
          select: { title: true, chapterId: true },
        },
        topic: {
          select: { title: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.debate.delete({
      where: { id },
    });
  }
}
