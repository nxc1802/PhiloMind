import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  async createQuiz(dto: { nodeId?: string; type: string; title: string; description?: string; questions: any }) {
    return this.prisma.quiz.create({
      data: {
        nodeId: dto.nodeId || null,
        type: dto.type,
        title: dto.title,
        description: dto.description || null,
        questions: dto.questions,
      },
    });
  }

  async getQuizzes(nodeId?: string) {
    return this.prisma.quiz.findMany({
      where: nodeId ? { nodeId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        node: {
          select: { title: true },
        },
      },
    });
  }

  async getQuizById(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { node: true },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async updateQuiz(id: string, dto: { nodeId?: string; type?: string; title?: string; description?: string; questions?: any }) {
    await this.getQuizById(id);
    const data: any = {};
    if (dto.nodeId !== undefined) data.nodeId = dto.nodeId || null;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description || null;
    if (dto.questions !== undefined) data.questions = dto.questions;

    return this.prisma.quiz.update({
      where: { id },
      data,
    });
  }

  async deleteQuiz(id: string) {
    await this.getQuizById(id);
    return this.prisma.quiz.delete({
      where: { id },
    });
  }
}
