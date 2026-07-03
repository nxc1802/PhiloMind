import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { TtlCache } from "../common/ttl-cache";

@Injectable()
export class QuizzesService {
  private readonly cache = new TtlCache<any[]>();

  constructor(private prisma: PrismaService) {}

  async createQuiz(dto: {
    nodeId?: string;
    type: string;
    title: string;
    description?: string;
    questions: any;
  }) {
    const quiz = await this.prisma.quiz.create({
      data: {
        nodeId: dto.nodeId || null,
        type: dto.type,
        title: dto.title,
        description: dto.description || null,
        questions: dto.questions,
      },
    });
    this.cache.clear();
    return quiz;
  }

  async getQuizzes(nodeId?: string) {
    return this.cache.getOrSet(`quizzes:${nodeId || "all"}`, 30000, () =>
      this.prisma.quiz.findMany({
        where: nodeId ? { nodeId } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          node: {
            select: { title: true },
          },
        },
      }),
    );
  }

  async getQuizById(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { node: true },
    });
    if (!quiz) throw new NotFoundException("Quiz not found");

    // Nếu là Đề thi thử (mock exam), lấy ngẫu nhiên câu hỏi từ các chương
    if (
      quiz.nodeId === null &&
      quiz.type === "mcq" &&
      quiz.title.toLowerCase().includes("thi thử")
    ) {
      const allChapterQuizzes = await this.prisma.quiz.findMany({
        where: { type: "mcq", nodeId: { not: null } },
      });

      const ch1Quiz = allChapterQuizzes.find((q) =>
        q.title.includes("Chương 1"),
      );
      const ch2Quiz = allChapterQuizzes.find((q) =>
        q.title.includes("Chương 2"),
      );
      const ch3Quiz = allChapterQuizzes.find((q) =>
        q.title.includes("Chương 3"),
      );

      let mockQuestions: any[] = [];
      const pickRandom = (questions: any, count: number) => {
        if (!Array.isArray(questions)) return [];
        return [...questions].sort(() => 0.5 - Math.random()).slice(0, count);
      };

      if (ch1Quiz) mockQuestions.push(...pickRandom(ch1Quiz.questions, 20));
      if (ch2Quiz) mockQuestions.push(...pickRandom(ch2Quiz.questions, 20));
      if (ch3Quiz) mockQuestions.push(...pickRandom(ch3Quiz.questions, 20));

      quiz.questions = mockQuestions.sort(() => 0.5 - Math.random());
    }

    return quiz;
  }

  async updateQuiz(
    id: string,
    dto: {
      nodeId?: string;
      type?: string;
      title?: string;
      description?: string;
      questions?: any;
    },
  ) {
    await this.getQuizById(id);
    const data: any = {};
    if (dto.nodeId !== undefined) data.nodeId = dto.nodeId || null;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined)
      data.description = dto.description || null;
    if (dto.questions !== undefined) data.questions = dto.questions;

    const quiz = await this.prisma.quiz.update({
      where: { id },
      data,
    });
    this.cache.clear();
    return quiz;
  }

  async deleteQuiz(id: string) {
    await this.getQuizById(id);
    const quiz = await this.prisma.quiz.delete({
      where: { id },
    });
    this.cache.clear();
    return quiz;
  }
}
